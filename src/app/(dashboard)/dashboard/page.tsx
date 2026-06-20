import { requireAuth } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import InviteForm from "@/components/dashboard/InviteForm";

export default async function DashboardPage() {
  const { user, workspace } = await requireAuth();

  const clientList = await db
    .select()
    .from(clients)
    .where(
      and(eq(clients.workspaceId, workspace.id), isNull(clients.deletedAt)),
    );

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

      <div>
        <h2 className="text-lg font-semibold mb-3">Clients</h2>
        {clientList.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Aucun client pour le moment. Invitez votre premier client ci-dessus.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
            {clientList.map((client) => (
              <li key={client.id} className="px-4 py-3 flex justify-between">
                <span className="font-medium">{client.name}</span>
                <span className="text-gray-500 text-sm">{client.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
