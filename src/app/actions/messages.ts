"use server";

import { createElement } from "react";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { clients, messages, projects, users, workspaces } from "@/db/schema";
import { getUserWorkspace } from "@/lib/auth";
import { sendNotification } from "@/lib/notify";
import MessageEmail from "@/emails/MessageEmail";

export async function postMessage(
  formData: FormData,
): Promise<{ error: string | null }> {
  const projectId = (formData.get("projectId") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();

  if (!projectId) return { error: "Projet manquant" };
  if (!content) return { error: "Le message ne peut pas être vide" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Try freelance auth first
  const freelanceData = await getUserWorkspace();
  if (freelanceData) {
    const { user, workspace } = freelanceData;

    const rows = await db
      .select({ project: projects, client: clients })
      .from(projects)
      .innerJoin(clients, eq(clients.id, projects.clientId))
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.workspaceId, workspace.id),
          isNull(projects.deletedAt),
        ),
      )
      .limit(1);

    if (!rows.length) return { error: "Projet introuvable" };

    const { project, client } = rows[0];

    await db.insert(messages).values({
      projectId,
      workspaceId: workspace.id,
      authorType: "freelance",
      content,
    });

    revalidatePath("/dashboard");

    await sendNotification({
      to: client.email,
      subject: `Nouveau message sur votre projet ${project.name}`,
      react: createElement(MessageEmail, {
        recipientName: client.name,
        senderName: user.fullName ?? user.email,
        projectName: project.name,
        content,
        link: `${appUrl}/portal/${workspace.slug}`,
      }),
      type: "message",
      payload: { projectId, authorType: "freelance", clientId: client.id },
    });

    return { error: null };
  }

  // Try client auth
  const cookieStore = await cookies();
  const portalToken = cookieStore.get("portal_token")?.value;
  if (!portalToken) return { error: "Non autorisé" };

  const clientRows = await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.inviteToken, portalToken),
        gt(clients.inviteExpiresAt, new Date()),
        isNull(clients.deletedAt),
      ),
    )
    .limit(1);

  if (!clientRows.length) return { error: "Non autorisé" };
  const client = clientRows[0];

  const projectRows = await db
    .select({ project: projects, workspace: workspaces })
    .from(projects)
    .innerJoin(workspaces, eq(workspaces.id, projects.workspaceId))
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.clientId, client.id),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!projectRows.length) return { error: "Projet introuvable" };

  const { project, workspace } = projectRows[0];

  await db.insert(messages).values({
    projectId,
    workspaceId: workspace.id,
    authorType: "client",
    content,
  });

  revalidatePath(`/portal/${workspace.slug}`);

  const freelanceRows = await db
    .select()
    .from(users)
    .where(eq(users.id, workspace.userId))
    .limit(1);

  if (freelanceRows.length) {
    const freelance = freelanceRows[0];
    await sendNotification({
      to: freelance.email,
      subject: `Nouveau message de ${client.name} sur le projet ${project.name}`,
      react: createElement(MessageEmail, {
        recipientName: freelance.fullName ?? freelance.email,
        senderName: client.name,
        projectName: project.name,
        content,
        link: `${appUrl}/dashboard`,
      }),
      type: "message",
      payload: { projectId, authorType: "client", clientId: client.id },
    });
  }

  return { error: null };
}
