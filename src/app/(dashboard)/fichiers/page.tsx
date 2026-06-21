import { and, desc, eq, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { clients, files, projects } from "@/db/schema";
import FilesTable, { type FileRow } from "@/components/dashboard/FilesTable";

export default async function FichiersPage() {
  const { user, workspace } = await requireAuth();

  const fileList = await db
    .select({
      id: files.id,
      name: files.name,
      mimeType: files.mimeType,
      sizeBytes: files.sizeBytes,
      uploadedBy: files.uploadedBy,
      createdAt: files.createdAt,
      projectName: projects.name,
      clientName: clients.name,
    })
    .from(files)
    .innerJoin(projects, eq(projects.id, files.projectId))
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(
      and(
        eq(files.workspaceId, workspace.id),
        isNull(files.deletedAt),
        isNull(projects.deletedAt),
        isNull(clients.deletedAt),
      ),
    )
    .orderBy(desc(files.createdAt));

  const rows: FileRow[] = fileList.map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    sizeBytes: f.sizeBytes,
    uploadedBy: f.uploadedBy,
    createdAtISO: f.createdAt.toISOString(),
    projectName: f.projectName,
    clientName: f.clientName,
  }));

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <FilesTable rows={rows} userName={user.fullName ?? user.email} />
    </main>
  );
}
