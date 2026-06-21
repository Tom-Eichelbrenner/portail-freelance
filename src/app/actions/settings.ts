"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { files, users, workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { deleteR2Files } from "@/lib/r2";

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

  revalidatePath("/", "layout");
  return { error: null, success: true };
}

export async function changePassword(
  _prev: { error: string | null; success: boolean },
  formData: FormData,
): Promise<{ error: string | null; success: boolean }> {
  const newPassword = (formData.get("newPassword") ?? "") as string;
  if (newPassword.length < 8) {
    return {
      error: "Le mot de passe doit contenir au moins 8 caractères",
      success: false,
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error)
    return {
      error: "Erreur lors du changement de mot de passe",
      success: false,
    };
  return { error: null, success: true };
}

export async function deleteAccount(_fd: FormData): Promise<void> {
  const { user, workspace } = await requireAuth();
  const supabase = await createClient();

  // Delete files from R2 before removing DB records
  const workspaceFiles = await db
    .select({ r2Key: files.r2Key })
    .from(files)
    .where(eq(files.workspaceId, workspace.id));

  await deleteR2Files(workspaceFiles.map((f) => f.r2Key)).catch(() => null);

  await db.delete(workspaces).where(eq(workspaces.userId, user.id));
  await db.delete(users).where(eq(users.id, user.id));
  await supabase.auth.admin.deleteUser(user.id).catch(() => null);
  await supabase.auth.signOut();

  redirect("/login");
}
