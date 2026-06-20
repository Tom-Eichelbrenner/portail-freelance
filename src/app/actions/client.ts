"use server";

import { createElement } from "react";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { resend } from "@/lib/resend";
import { requireAuth } from "@/lib/auth";
import { canAddClient } from "@/lib/subscription";
import InviteEmail from "@/emails/InviteEmail";

const inviteSchema = z.object({
  clientName: z.string().min(1, "Le nom est requis"),
  clientEmail: z.string().email("Email invalide"),
  workspaceId: z.string().uuid("Workspace invalide"),
});

export type InviteState = { error: string | null; success: string | null };

export async function inviteClient(
  prevState: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const { user, workspace } = await requireAuth();

  const parsed = inviteSchema.safeParse({
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    workspaceId: formData.get("workspaceId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Données invalides",
      success: null,
    };
  }

  if (parsed.data.workspaceId !== workspace.id) {
    return { error: "Workspace invalide", success: null };
  }

  const guard = await canAddClient(user.id, workspace.id);
  if (!guard.allowed) {
    return { error: guard.error ?? "Limite atteinte", success: null };
  }

  const existing = await db
    .select({ id: clients.id })
    .from(clients)
    .where(
      and(
        eq(clients.workspaceId, workspace.id),
        eq(clients.email, parsed.data.clientEmail),
        isNull(clients.deletedAt),
      ),
    )
    .limit(1);

  if (existing.length) {
    return { error: "Ce client a déjà été invité", success: null };
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(clients).values({
    workspaceId: workspace.id,
    name: parsed.data.clientName,
    email: parsed.data.clientEmail,
    inviteToken: token,
    inviteExpiresAt: expiresAt,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portalLink = `${appUrl}/portal/${workspace.slug}?token=${token}`;

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to: parsed.data.clientEmail,
    subject: `Invitation au portail de ${workspace.name}`,
    react: createElement(InviteEmail, {
      clientName: parsed.data.clientName,
      workspaceName: workspace.name,
      portalLink,
    }),
  });

  if (emailError) {
    console.warn("Email non envoyé (Resend):", emailError);
  }

  return {
    error: null,
    success: emailError
      ? `Client ajouté. Email non envoyé (${emailError.message}) — lien : ${portalLink}`
      : `Invitation envoyée à ${parsed.data.clientEmail}`,
  };
}
