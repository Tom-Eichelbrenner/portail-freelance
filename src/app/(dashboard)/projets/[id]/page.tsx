import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Share2, MoreHorizontal } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { clients, files, invoices, messages, projects } from "@/db/schema";
import FileUpload from "@/components/ui/FileUpload";
import MessageThread from "@/components/ui/MessageThread";
import InlineStatusSelect from "@/components/ui/InlineStatusSelect";
import ProjectInvoiceSection from "@/components/dashboard/ProjectInvoiceSection";

const AVATAR_PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
];
const LATE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function avatarColor(name: string) {
  return AVATAR_PALETTE[(name.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
}

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

  const [fileList, messageList, allWorkspaceInvoices, projectInvoiceRows] =
    await Promise.all([
      db
        .select({
          id: files.id,
          name: files.name,
          mimeType: files.mimeType,
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
        .select({ id: invoices.id, createdAt: invoices.createdAt })
        .from(invoices)
        .where(
          and(
            eq(invoices.workspaceId, workspace.id),
            isNull(invoices.deletedAt),
          ),
        )
        .orderBy(asc(invoices.createdAt)),
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

  // Build global invoice numbers (FAC-YYYY-NNN)
  const yearCounters = new Map<number, number>();
  const invoiceNumMap = new Map<string, string>();
  for (const inv of allWorkspaceInvoices) {
    const year = inv.createdAt.getFullYear();
    const n = (yearCounters.get(year) ?? 0) + 1;
    yearCounters.set(year, n);
    invoiceNumMap.set(inv.id, `FAC-${year}-${String(n).padStart(3, "0")}`);
  }

  const now = Date.now();
  const invoiceList = projectInvoiceRows.map((inv) => ({
    id: inv.id,
    num: invoiceNumMap.get(inv.id) ?? "FAC-?",
    amount: inv.amount,
    currency: inv.currency,
    description: inv.description,
    status:
      inv.status === "paid"
        ? "paid"
        : now - inv.createdAt.getTime() > LATE_THRESHOLD_MS &&
            inv.status === "pending"
          ? "late"
          : inv.status,
    stripePaymentLinkUrl: inv.stripePaymentLinkUrl,
    createdAtISO: inv.createdAt.toISOString(),
  }));

  const isPro = user.subscriptionStatus === "active" && !!user.subscriptionPlan;
  const clientColor = avatarColor(client.name);
  const clientInitials = initials(client.name);

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 32px",
          borderBottom: "1px solid var(--border-default)",
          fontSize: 13.5,
          background: "var(--surface-page)",
          flexShrink: 0,
        }}
      >
        <Link
          href="/projets"
          style={{ color: "var(--text-secondary)", textDecoration: "none" }}
        >
          Projets
        </Link>
        <ChevronRight
          size={15}
          strokeWidth={2}
          style={{ color: "var(--slate-300)", flexShrink: 0 }}
        />
        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
          {project.name}
        </span>
      </div>

      {/* Header */}
      <div
        style={{
          padding: "26px 32px 22px",
          borderBottom: "1px solid var(--border-default)",
          background: "var(--surface-page)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 27,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1.15,
              }}
            >
              {project.name}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginTop: 11,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--text-tertiary)",
                }}
              >
                Client
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 10px 4px 5px",
                  border: "1px solid var(--border-default)",
                  borderRadius: 9999,
                  background: "var(--surface-card)",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 9999,
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: clientColor,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 10,
                    boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)",
                  }}
                >
                  {clientInitials}
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {client.name}
                </span>
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                height: 40,
                padding: "0 16px",
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--text-primary)",
                background: "var(--surface-card)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
              }}
            >
              <Share2 size={16} strokeWidth={2} />
              Partager
            </button>
            <button
              type="button"
              style={{
                width: 40,
                height: 40,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-card)",
                color: "var(--slate-500)",
                cursor: "pointer",
              }}
            >
              <MoreHorizontal size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Status segmented control */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 20,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-tertiary)",
            }}
          >
            Statut
          </span>
          <InlineStatusSelect projectId={project.id} status={project.status} />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 32px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
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

          <MessageThread
            projectId={project.id}
            initialMessages={messageList.map((m) => ({
              ...m,
              createdAt: m.createdAt.toISOString(),
            }))}
            viewerType="freelance"
            clientName={client.name}
          />

          <ProjectInvoiceSection
            projectId={project.id}
            clientId={client.id}
            invoices={invoiceList}
            isPro={isPro}
          />
        </div>
      </div>
    </main>
  );
}
