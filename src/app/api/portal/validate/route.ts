import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { clients, workspaces } from "@/db/schema";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const slug = searchParams.get("slug");

  if (!token || !slug) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const rows = await db
    .select({ client: clients, workspace: workspaces })
    .from(clients)
    .innerJoin(workspaces, eq(workspaces.id, clients.workspaceId))
    .where(
      and(
        eq(clients.inviteToken, token),
        gt(clients.inviteExpiresAt, new Date()),
        isNull(clients.deletedAt),
        eq(workspaces.slug, slug),
      ),
    )
    .limit(1);

  if (!rows.length) {
    return NextResponse.redirect(
      `${origin}/portal/${slug}?error=invalid_token`,
    );
  }

  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set("portal_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return NextResponse.redirect(`${origin}/portal/${slug}`);
}
