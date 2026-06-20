import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { clients, workspaces } from "@/db/schema";

const SESSION_DURATION_DAYS = 30;
// After the client first accesses the portal, extend their token validity
// to 1 year so the 7-day invite window no longer locks them out.
const POST_ACCESS_EXPIRY_DAYS = 365;

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

  const { client } = rows[0];

  // On first access: stamp firstAccessedAt and extend the token expiry
  // so the client isn't locked out after the initial 7-day invite window.
  if (!client.firstAccessedAt) {
    const longExpiry = new Date(
      Date.now() + POST_ACCESS_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );
    await db
      .update(clients)
      .set({
        firstAccessedAt: new Date(),
        inviteExpiresAt: longExpiry,
      })
      .where(eq(clients.id, client.id));
  }

  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set("portal_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: "/",
  });

  return NextResponse.redirect(`${origin}/portal/${slug}`);
}
