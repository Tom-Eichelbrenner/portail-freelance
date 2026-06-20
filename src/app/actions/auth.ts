"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, workspaces } from "@/db/schema";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court (8 caractères minimum)"),
});

const signupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court (8 caractères minimum)"),
  fullName: z.string().min(1, "Le nom complet est requis"),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function login(
  prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: "Erreur de connexion au serveur" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (
      error.message.toLowerCase().includes("email") &&
      error.message.toLowerCase().includes("confirm")
    ) {
      return { error: "Confirmez votre email avant de vous connecter" };
    }
    return { error: "Email ou mot de passe incorrect" };
  }

  redirect("/dashboard");
}

export async function signup(
  prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Erreur lors de la création du compte" };
  }

  const baseSlug = slugify(parsed.data.fullName) || "workspace";
  const slug = `${baseSlug}-${data.user.id.slice(0, 8)}`;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: data.user!.id,
        email: parsed.data.email,
        fullName: parsed.data.fullName,
      });

      await tx.insert(workspaces).values({
        userId: data.user!.id,
        name: `Workspace de ${parsed.data.fullName}`,
        slug,
      });
    });
  } catch {
    return { error: "Erreur lors de la création du workspace" };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
