"use server";

import { createElement } from "react";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { sendNotification } from "@/lib/notify";
import StatusChangeEmail from "@/emails/StatusChangeEmail";
import { STATUS_LABELS } from "@/lib/project-statuses";

const createSchema = z.object({
  clientId: z.string().uuid("Client invalide"),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

export async function createProject(
  formData: FormData,
): Promise<{ error: string | null }> {
  const { workspace } = await requireAuth();

  const parsed = createSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    description: (formData.get("description") as string) || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const clientRows = await db
    .select({ id: clients.id })
    .from(clients)
    .where(
      and(
        eq(clients.id, parsed.data.clientId),
        eq(clients.workspaceId, workspace.id),
        isNull(clients.deletedAt),
      ),
    )
    .limit(1);

  if (!clientRows.length) return { error: "Client introuvable" };

  await db.insert(projects).values({
    workspaceId: workspace.id,
    clientId: parsed.data.clientId,
    name: parsed.data.name,
    description: parsed.data.description,
    status: "todo",
  });

  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateProjectStatus(
  projectId: string,
  status: string,
): Promise<{ error: string | null }> {
  const { workspace } = await requireAuth();

  if (!Object.keys(STATUS_LABELS).includes(status)) {
    return { error: "Statut invalide" };
  }

  const rows = await db
    .select({ project: projects, client: clients })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.workspaceId, workspace.id),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!rows.length) return { error: "Projet introuvable" };

  const { project, client } = rows[0];

  await db
    .update(projects)
    .set({ status, updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  revalidatePath("/dashboard");
  revalidatePath(`/portal/${workspace.slug}`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendNotification({
    to: client.email,
    subject: `Mise à jour de votre projet ${project.name}`,
    react: createElement(StatusChangeEmail, {
      clientName: client.name,
      projectName: project.name,
      newStatus: status,
      statusLabel: STATUS_LABELS[status],
      portalLink: `${appUrl}/portal/${workspace.slug}`,
    }),
    type: "status_change",
    payload: {
      projectId,
      projectName: project.name,
      clientId: client.id,
      newStatus: status,
    },
  });

  return { error: null };
}

export async function deleteProject(
  projectId: string,
): Promise<{ error: string | null }> {
  const { workspace } = await requireAuth();

  const rows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.workspaceId, workspace.id),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!rows.length) return { error: "Projet introuvable" };

  await db
    .update(projects)
    .set({ deletedAt: new Date() })
    .where(eq(projects.id, projectId));

  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const projectId = formData.get("projectId") as string;
  await deleteProject(projectId);
}
