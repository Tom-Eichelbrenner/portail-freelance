import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, asc, eq, gt, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { clients, files, messages, projects, workspaces } from "@/db/schema";
import FileUpload from "@/components/ui/FileUpload";
import MessageThread from "@/components/ui/MessageThread";
import { STATUS_LABELS, STATUS_CLASSES } from "@/lib/project-statuses";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function PortalPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token: urlToken, error: urlError } = await searchParams;

  if (urlToken) {
    redirect(
      `/api/portal/validate?token=${encodeURIComponent(urlToken)}&slug=${encodeURIComponent(slug)}`,
    );
  }

  if (urlError === "invalid_token") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">
            Lien invalide ou expiré
          </h1>
          <p className="text-gray-600 text-sm">
            Ce lien d&apos;invitation n&apos;est plus valide. Contactez votre
            prestataire pour recevoir un nouveau lien.
          </p>
        </div>
      </div>
    );
  }

  const cookieStore = await cookies();
  const portalToken = cookieStore.get("portal_token")?.value;

  if (!portalToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-bold mb-2">Accès requis</h1>
          <p className="text-gray-600 text-sm">
            Utilisez le lien reçu par email pour accéder à ce portail.
          </p>
        </div>
      </div>
    );
  }

  const rows = await db
    .select({ client: clients, workspace: workspaces })
    .from(clients)
    .innerJoin(workspaces, eq(workspaces.id, clients.workspaceId))
    .where(
      and(
        eq(clients.inviteToken, portalToken),
        gt(clients.inviteExpiresAt, new Date()),
        isNull(clients.deletedAt),
        eq(workspaces.slug, slug),
      ),
    )
    .limit(1);

  if (!rows.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">
            Lien invalide ou expiré
          </h1>
          <p className="text-gray-600 text-sm">
            Ce lien d&apos;invitation n&apos;est plus valide. Contactez votre
            prestataire pour recevoir un nouveau lien.
          </p>
        </div>
      </div>
    );
  }

  const { client, workspace } = rows[0];

  const clientProjects = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.clientId, client.id),
        eq(projects.workspaceId, workspace.id),
        isNull(projects.deletedAt),
      ),
    )
    .orderBy(asc(projects.createdAt));

  const projectIds = clientProjects.map((p) => p.id);

  const [fileList, messageList] =
    projectIds.length > 0
      ? await Promise.all([
          db
            .select()
            .from(files)
            .where(
              and(
                inArray(files.projectId, projectIds),
                isNull(files.deletedAt),
              ),
            )
            .orderBy(asc(files.createdAt)),
          db
            .select()
            .from(messages)
            .where(
              and(
                inArray(messages.projectId, projectIds),
                isNull(messages.deletedAt),
              ),
            )
            .orderBy(asc(messages.createdAt)),
        ])
      : [[], []];

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
      <div>
        <h1 className="text-2xl font-bold">Bienvenue, {client.name}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Portail de <span className="font-medium">{workspace.name}</span>
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Vos projets</h2>

        {clientProjects.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Aucun projet pour le moment. Votre prestataire en créera bientôt.
          </p>
        ) : (
          <div className="space-y-4">
            {clientProjects.map((project) => {
              const statusLabel =
                STATUS_LABELS[project.status] ?? STATUS_LABELS.todo;
              const statusClass =
                STATUS_CLASSES[project.status] ?? STATUS_CLASSES.todo;

              const projectFiles = (filesByProject[project.id] ?? []).map(
                (f) => ({
                  id: f.id,
                  name: f.name,
                  sizeBytes: f.sizeBytes,
                  uploadedBy: f.uploadedBy,
                  createdAt: f.createdAt.toISOString(),
                }),
              );

              const projectMessages = (messagesByProject[project.id] ?? []).map(
                (m) => ({
                  id: m.id,
                  content: m.content,
                  authorType: m.authorType,
                  createdAt: m.createdAt.toISOString(),
                }),
              );

              return (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg px-4 py-4"
                >
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
                    <span
                      className={`text-xs font-medium rounded-full px-3 py-1 shrink-0 ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <FileUpload
                    projectId={project.id}
                    initialFiles={projectFiles}
                    viewerType="client"
                  />

                  <MessageThread
                    projectId={project.id}
                    initialMessages={projectMessages}
                    viewerType="client"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
