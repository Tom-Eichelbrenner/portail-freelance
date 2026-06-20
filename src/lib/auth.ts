import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserWorkspace() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const rows = await db
    .select()
    .from(users)
    .innerJoin(workspaces, eq(workspaces.userId, users.id))
    .where(eq(users.id, user.id))
    .limit(1);

  if (!rows.length) return null;
  return { user: rows[0].users, workspace: rows[0].workspaces };
}

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await getUserWorkspace();
  if (!data) redirect("/login?error=no_workspace");
  return data;
}
