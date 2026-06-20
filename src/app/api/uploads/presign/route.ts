import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { clients, files, projects } from "@/db/schema";
import { getUserWorkspace } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/r2";

const MAX_SIZE = 50 * 1024 * 1024;

const bodySchema = z.object({
  projectId: z.string().uuid(),
  fileName: z.string().min(1),
  mimeType: z.string(),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_SIZE, "Fichier trop volumineux (max 50 Mo)"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 },
    );
  }

  const { projectId, fileName, mimeType, sizeBytes } = parsed.data;

  // Try freelance auth
  const freelanceData = await getUserWorkspace();
  if (freelanceData) {
    const { workspace } = freelanceData;

    const projectRows = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.workspaceId, workspace.id),
          isNull(projects.deletedAt),
        ),
      )
      .limit(1);

    if (!projectRows.length) {
      return NextResponse.json(
        { error: "Projet introuvable" },
        { status: 403 },
      );
    }

    const r2Key = `${workspace.id}/${projectId}/${crypto.randomUUID()}-${fileName}`;
    const uploadUrl = await getPresignedUploadUrl(r2Key);

    const [file] = await db
      .insert(files)
      .values({
        projectId,
        workspaceId: workspace.id,
        name: fileName,
        r2Key,
        sizeBytes,
        mimeType,
        uploadedBy: "freelance",
      })
      .returning({ id: files.id });

    return NextResponse.json({ uploadUrl, fileId: file.id });
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
        eq(projects.id, projectId),
        eq(projects.clientId, client.id),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!projectRows.length) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 403 });
  }

  const project = projectRows[0];
  const r2Key = `${project.workspaceId}/${projectId}/${crypto.randomUUID()}-${fileName}`;
  const uploadUrl = await getPresignedUploadUrl(r2Key);

  const [file] = await db
    .insert(files)
    .values({
      projectId,
      workspaceId: project.workspaceId,
      name: fileName,
      r2Key,
      sizeBytes,
      mimeType,
      uploadedBy: "client",
    })
    .returning({ id: files.id });

  return NextResponse.json({ uploadUrl, fileId: file.id });
}
