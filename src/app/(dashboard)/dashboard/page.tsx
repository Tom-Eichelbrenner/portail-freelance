import { and, asc, eq, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { deleteProjectAction } from "@/app/actions/projects";
import { db } from "@/db";
import { clients, files, messages, projects } from "@/db/schema";
import InviteForm from "@/components/dashboard/InviteForm";
import CreateProjectForm from "@/components/dashboard/CreateProjectForm";
import StatusButton from "@/components/dashboard/StatusButton";
import FileUpload from "@/components/ui/FileUpload";
import MessageThread from "@/components/ui/MessageThread";

export default async function DashboardPage() {
  const { user, workspace } = await requireAuth();

  const [clientList, projectList, fileList, messageList] = await Promise.all([
    db
      .select()
      .from(clients)
      .where(
        and(eq(clients.workspaceId, workspace.id), isNull(clients.deletedAt)),
      )
      .orderBy(asc(clients.createdAt)),
    db
      .select()
      .from(projects)
      .where(
        and(eq(projects.workspaceId, workspace.id), isNull(projects.deletedAt)),
      )
      .orderBy(asc(projects.createdAt)),
    db
      .select()
      .from(files)
      .where(and(eq(files.workspaceId, workspace.id), isNull(files.deletedAt)))
      .orderBy(asc(files.createdAt)),
    db
      .select()
      .from(messages)
      .where(
        and(eq(messages.workspaceId, workspace.id), isNull(messages.deletedAt)),
      )
      .orderBy(asc(messages.createdAt)),
  ]);

  const projectsByClient = projectList.reduce<
    Record<string, typeof projectList>
  >((acc, p) => {
    (acc[p.clientId] ??= []).push(p);
    return acc;
  }, {});

  const filesByProject = fileList.reduce<Record<string, typeof fileList>>(
    (acc, f) => {
      (acc[f.projectId] ??= []).push(f);
      return acc;
    },
    {},
  );

  const messagesByProject = messageList.reduce<
    Record<string, typeof messageList>
  >((acc, m) => {
    (acc[m.projectId] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Bonjour, {user.fullName ?? user.email}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Workspace :{" "}
            <span className="font-mono bg-gray-100 px-1 rounded">
              {workspace.slug}
            </span>
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
          >
            Déconnexion
          </button>
        </form>
      </div>

      <InviteForm workspaceId={workspace.id} />

      <CreateProjectForm
        clients={clientList.map((c) => ({ id: c.id, name: c.name }))}
      />

      <div>
        <h2 className="text-lg font-semibold mb-4">Clients et projets</h2>

        {clientList.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Aucun client pour le moment. Invitez votre premier client ci-dessus.
          </p>
        ) : (
          <div className="space-y-6">
            {clientList.map((client) => {
              const clientProjects = projectsByClient[client.id] ?? [];

              return (
                <div
                  key={client.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <span className="font-medium">{client.name}</span>
                    <span className="text-gray-400 text-sm">
                      {client.email}
                    </span>
                  </div>

                  {clientProjects.length === 0 ? (
                    <p className="px-4 py-4 text-gray-400 text-sm">
                      Aucun projet — créez-en un ci-dessus.
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {clientProjects.map((project) => {
                        const projectFiles = (
                          filesByProject[project.id] ?? []
                        ).map((f) => ({
                          id: f.id,
                          name: f.name,
                          sizeBytes: f.sizeBytes,
                          uploadedBy: f.uploadedBy,
                          createdAt: f.createdAt.toISOString(),
                        }));

                        const projectMessages = (
                          messagesByProject[project.id] ?? []
                        ).map((m) => ({
                          id: m.id,
                          content: m.content,
                          authorType: m.authorType,
                          createdAt: m.createdAt.toISOString(),
                        }));

                        return (
                          <div key={project.id} className="px-4 py-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-medium text-gray-900">
                                  {project.name}
                                </h3>
                                {project.description && (
                                  <p className="text-gray-500 text-sm mt-0.5">
                                    {project.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <StatusButton
                                  projectId={project.id}
                                  currentStatus={project.status}
                                />
                                <form action={deleteProjectAction}>
                                  <input
                                    type="hidden"
                                    name="projectId"
                                    value={project.id}
                                  />
                                  <button
                                    type="submit"
                                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                    title="Supprimer"
                                  >
                                    ✕
                                  </button>
                                </form>
                              </div>
                            </div>

                            <FileUpload
                              projectId={project.id}
                              initialFiles={projectFiles}
                              viewerType="freelance"
                            />

                            <MessageThread
                              projectId={project.id}
                              initialMessages={projectMessages}
                              viewerType="freelance"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
