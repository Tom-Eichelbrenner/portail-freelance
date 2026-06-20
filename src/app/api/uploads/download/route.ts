import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { clients, files, projects } from "@/db/schema";
import { getUserWorkspace } from "@/lib/auth";
import { getPresignedDownloadUrl } from "@/lib/r2";

export async function GET(request: NextRequest) {
  const fileId = new URL(request.url).searchParams.get("fileId");
  if (!fileId) {
    return NextResponse.json({ error: "fileId requis" }, { status: 400 });
  }

  const fileRows = await db
    .select()
    .from(files)
    .where(and(eq(files.id, fileId), isNull(files.deletedAt)))
    .limit(1);

  if (!fileRows.length) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }

  const file = fileRows[0];

  // Try freelance auth
  const freelanceData = await getUserWorkspace();
  if (freelanceData) {
    if (file.workspaceId !== freelanceData.workspace.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const url = await getPresignedDownloadUrl(file.r2Key);
    return NextResponse.redirect(url);
  }

  // Try client auth
  const cookieStore = await cookies();
  const portalToken = cookieStore.get("portal_token")?.value;
  if (!portalToken) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

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

  if (!clientRows.length) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const client = clientRows[0];

  const projectRows = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, file.projectId),
        eq(projects.clientId, client.id),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!projectRows.length) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const url = await getPresignedDownloadUrl(file.r2Key);
  return NextResponse.redirect(url);
}
