import { and, desc, eq, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import ClientsTable, {
  type ClientRow,
} from "@/components/dashboard/ClientsTable";

export default async function ClientsPage() {
  const { workspace } = await requireAuth();

  const [clientList, projectList] = await Promise.all([
    db
      .select()
      .from(clients)
      .where(
        and(eq(clients.workspaceId, workspace.id), isNull(clients.deletedAt)),
      )
      .orderBy(desc(clients.createdAt)),
    db
      .select()
      .from(projects)
      .where(
        and(eq(projects.workspaceId, workspace.id), isNull(projects.deletedAt)),
      ),
  ]);

  const projectsByClient = projectList.reduce<
    Record<string, typeof projectList>
  >((acc, p) => {
    (acc[p.clientId] ??= []).push(p);
    return acc;
  }, {});

  const rows: ClientRow[] = clientList.map((client) => {
    const cProjects = projectsByClient[client.id] ?? [];
    const activeCount = cProjects.filter((p) => p.status !== "approved").length;
    const lastProjectActivity =
      cProjects.length > 0
        ? cProjects.reduce(
            (max, p) => (p.updatedAt > max ? p.updatedAt : max),
            cProjects[0].updatedAt,
          )
        : null;

    // "Actif"  = client has ever opened their portal (firstAccessedAt set)
    // "Invité" = invited but hasn't clicked the link yet
    // "Inactif"= no token (deleted/never had one) and never connected
    const status: ClientRow["status"] = client.firstAccessedAt
      ? "Actif"
      : client.inviteToken
        ? "Invité"
        : "Inactif";

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      projectCount: activeCount,
      lastActivityISO: (lastProjectActivity ?? client.createdAt).toISOString(),
      createdAtISO: client.createdAt.toISOString(),
      firstAccessedAtISO: client.firstAccessedAt?.toISOString() ?? null,
      status,
      inviteToken: client.inviteToken,
    };
  });

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <ClientsTable
        rows={rows}
        workspaceSlug={workspace.slug}
        workspaceId={workspace.id}
      />
    </main>
  );
}
