import { and, count, eq, isNull, sum } from "drizzle-orm";
import { db } from "@/db";
import { clients, files, users } from "@/db/schema";

const SOLO_MAX_CLIENTS = 5;
const SOLO_STORAGE_BYTES = 5 * 1024 * 1024 * 1024;
const PRO_STORAGE_BYTES = 20 * 1024 * 1024 * 1024;

export async function canAddClient(
  userId: string,
  workspaceId: string,
): Promise<{ allowed: boolean; error?: string }> {
  const [u] = await db
    .select({ plan: users.subscriptionPlan })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!u || u.plan !== "solo") return { allowed: true };

  const [row] = await db
    .select({ n: count() })
    .from(clients)
    .where(
      and(eq(clients.workspaceId, workspaceId), isNull(clients.deletedAt)),
    );

  if ((row?.n ?? 0) >= SOLO_MAX_CLIENTS) {
    return { allowed: false, error: "Limite atteinte — passez au plan Pro" };
  }
  return { allowed: true };
}

export async function canUploadFile(
  userId: string,
  workspaceId: string,
  sizeBytes: number,
): Promise<{ allowed: boolean; error?: string }> {
  const [u] = await db
    .select({ plan: users.subscriptionPlan })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const maxBytes = u?.plan === "pro" ? PRO_STORAGE_BYTES : SOLO_STORAGE_BYTES;

  const [row] = await db
    .select({ total: sum(files.sizeBytes) })
    .from(files)
    .where(and(eq(files.workspaceId, workspaceId), isNull(files.deletedAt)));

  const used = Number(row?.total ?? 0);
  if (used + sizeBytes > maxBytes) {
    return { allowed: false, error: "Limite atteinte — passez au plan Pro" };
  }
  return { allowed: true };
}

export function isPlanPro(
  subscriptionPlan: string | null | undefined,
): boolean {
  return subscriptionPlan === "pro";
}
