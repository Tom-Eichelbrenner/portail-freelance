import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import ProjectsView, {
  type ProjectRow,
} from "@/components/dashboard/ProjectsView";

export default async function ProjetsPage() {
  const { workspace } = await requireAuth();

  const [projectList, clientList] = await Promise.all([
    db
      .select({
        id: projects.id,
        name: projects.name,
        clientId: projects.clientId,
        clientName: clients.name,
        status: projects.status,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .innerJoin(clients, eq(clients.id, projects.clientId))
      .where(
        and(eq(projects.workspaceId, workspace.id), isNull(projects.deletedAt)),
      )
      .orderBy(desc(projects.updatedAt)),
    db
      .select({ id: clients.id, name: clients.name })
      .from(clients)
      .where(
        and(eq(clients.workspaceId, workspace.id), isNull(clients.deletedAt)),
      )
      .orderBy(asc(clients.name)),
  ]);

  const rows: ProjectRow[] = projectList.map((p) => ({
    id: p.id,
    name: p.name,
    clientId: p.clientId,
    clientName: p.clientName,
    status: p.status,
    updatedAtISO: p.updatedAt.toISOString(),
  }));

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <ProjectsView rows={rows} clients={clientList} />
    </main>
  );
}
