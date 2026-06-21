"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { users, workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const saveSchema = z.object({
  workspaceName: z.string().min(1, "Le nom est requis").max(100),
  accentColor: z.string().regex(/^#[0-9a-f]{6}$/i, "Couleur invalide"),
  fullName: z.string().min(1, "Le nom est requis").max(100),
  email: z.string().email("Email invalide"),
});

export async function saveSettings(
  _prev: { error: string | null; success: boolean },
  formData: FormData,
): Promise<{ error: string | null; success: boolean }> {
  const { user, workspace } = await requireAuth();

  const parsed = saveSchema.safeParse({
    workspaceName: formData.get("workspaceName"),
    accentColor: formData.get("accentColor"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Données invalides",
      success: false,
    };
  }

  await Promise.all([
    db
      .update(workspaces)
      .set({
        name: parsed.data.workspaceName,
        accentColor: parsed.data.accentColor,
      })
      .where(eq(workspaces.id, workspace.id)),
    db
      .update(users)
      .set({ fullName: parsed.data.fullName })
      .where(eq(users.id, user.id)),
  ]);

  if (parsed.data.email !== user.email) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      email: parsed.data.email,
    });
    if (error) {
      return {
        error: "Erreur lors de la mise à jour de l'email",
        success: false,
      };
    }
  }

  revalidatePath("/settings");
  return { error: null, success: true };
}

export async function deleteAccount(_fd: FormData): Promise<void> {
  const { user } = await requireAuth();
  const supabase = await createClient();

  await db.delete(workspaces).where(eq(workspaces.userId, user.id));
  await db.delete(users).where(eq(users.id, user.id));
  await supabase.auth.admin.deleteUser(user.id).catch(() => null);
  await supabase.auth.signOut();

  redirect("/login");
}
