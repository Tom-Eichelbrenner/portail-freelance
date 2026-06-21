import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { clients, files, invoices, messages, projects } from "@/db/schema";
import { STATUS_LABELS } from "@/lib/project-statuses";
import FileUpload from "@/components/ui/FileUpload";
import MessageThread from "@/components/ui/MessageThread";
import InlineStatusSelect from "@/components/ui/InlineStatusSelect";
import ProjectInvoiceSection from "@/components/dashboard/ProjectInvoiceSection";

export default async function ProjetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, workspace } = await requireAuth();

  const rows = await db
    .select({ project: projects, client: clients })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(
      and(
        eq(projects.id, id),
        eq(projects.workspaceId, workspace.id),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!rows.length) notFound();
  const { project, client } = rows[0];

  const [fileList, messageList, invoiceList] = await Promise.all([
    db
      .select({
        id: files.id,
        name: files.name,
        sizeBytes: files.sizeBytes,
        uploadedBy: files.uploadedBy,
        createdAt: files.createdAt,
      })
      .from(files)
      .where(
        and(
          eq(files.projectId, id),
          eq(files.workspaceId, workspace.id),
          isNull(files.deletedAt),
        ),
      )
      .orderBy(asc(files.createdAt)),
    db
      .select({
        id: messages.id,
        content: messages.content,
        authorType: messages.authorType,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        and(
          eq(messages.projectId, id),
          eq(messages.workspaceId, workspace.id),
          isNull(messages.deletedAt),
        ),
      )
      .orderBy(asc(messages.createdAt)),
    db
      .select({
        id: invoices.id,
        amount: invoices.amount,
        currency: invoices.currency,
        description: invoices.description,
        status: invoices.status,
        stripePaymentLinkUrl: invoices.stripePaymentLinkUrl,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.projectId, id),
          eq(invoices.workspaceId, workspace.id),
          isNull(invoices.deletedAt),
        ),
      )
      .orderBy(asc(invoices.createdAt)),
  ]);

  const isPro = user.subscriptionStatus === "active" && !!user.subscriptionPlan;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 0,
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 28px 18px",
          borderBottom: "1px solid var(--border-default)",
          background: "var(--surface-page)",
          flexShrink: 0,
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--text-tertiary)",
            marginBottom: 12,
          }}
        >
          <Link
            href="/projets"
            style={{ color: "var(--text-tertiary)", textDecoration: "none" }}
          >
            Projets
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>{project.name}</span>
        </div>

        {/* Title row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
              flex: 1,
              minWidth: 0,
            }}
          >
            {project.name}
          </h1>

          <span
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              background: "var(--surface-sunken)",
              border: "1px solid var(--border-default)",
              borderRadius: 9999,
              padding: "3px 10px",
              whiteSpace: "nowrap",
            }}
          >
            {client.name}
          </span>

          <InlineStatusSelect projectId={project.id} status={project.status} />
        </div>

        {project.description && (
          <p
            style={{
              fontSize: 13.5,
              color: "var(--text-secondary)",
              margin: "8px 0 0",
              lineHeight: 1.5,
            }}
          >
            {project.description}
          </p>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Fichiers */}
        <section>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              margin: "0 0 14px",
            }}
          >
            Fichiers
          </h2>
          <div
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-default)",
              borderRadius: 12,
              boxShadow: "var(--shadow-sm)",
              padding: 20,
            }}
          >
            <FileUpload
              projectId={project.id}
              initialFiles={fileList.map((f) => ({
                ...f,
                createdAt: f.createdAt.toISOString(),
              }))}
              viewerType="freelance"
            />
          </div>
        </section>

        {/* Messages */}
        <section>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              margin: "0 0 14px",
            }}
          >
            Messages
          </h2>
          <div
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-default)",
              borderRadius: 12,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <MessageThread
              projectId={project.id}
              initialMessages={messageList.map((m) => ({
                ...m,
                createdAt: m.createdAt.toISOString(),
              }))}
              viewerType="freelance"
            />
          </div>
        </section>

        {/* Factures */}
        <section>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              margin: "0 0 14px",
            }}
          >
            Factures
          </h2>
          <ProjectInvoiceSection
            projectId={project.id}
            clientId={client.id}
            invoices={invoiceList.map((inv) => ({
              ...inv,
              createdAtISO: inv.createdAt.toISOString(),
            }))}
            isPro={isPro}
            statusLabels={STATUS_LABELS}
          />
        </section>
      </div>
    </div>
  );
}
