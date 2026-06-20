import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { clients, projects, workspaces } from "@/db/schema";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function PortalPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token: urlToken, error: urlError } = await searchParams;

  // Redirect to validate route when a token is provided in the URL
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

  // Read the portal_token cookie set after validation
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

  // Validate cookie token against DB
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
    .where(and(eq(projects.clientId, client.id), isNull(projects.deletedAt)));

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Bienvenue, {client.name}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Portail de <span className="font-medium">{workspace.name}</span>
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Vos projets</h2>
        {clientProjects.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun projet pour le moment.</p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
            {clientProjects.map((project) => (
              <li key={project.id} className="px-4 py-3">
                <span className="font-medium">{project.name}</span>
                {project.description && (
                  <p className="text-gray-500 text-sm mt-0.5">
                    {project.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
