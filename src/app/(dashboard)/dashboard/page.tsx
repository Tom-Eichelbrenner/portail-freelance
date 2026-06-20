import { and, desc, eq, isNull } from "drizzle-orm";
import {
  Users,
  FolderOpen,
  ReceiptEuro,
  Wallet,
  Search,
  Send,
  MessageSquare,
  Upload,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { createBillingPortalSession } from "@/app/actions/stripe";
import { db } from "@/db";
import { clients, files, invoices, messages, projects } from "@/db/schema";
import InviteModal from "@/components/dashboard/InviteModal";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
];

function getAvatar(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const color =
    AVATAR_PALETTE[(name.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
  return { initials: initials || "?", color };
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffH < 1) return "il y a quelques minutes";
  if (diffH < 24) return `il y a ${diffH} h`;
  if (diffD === 1) return "hier";
  return `il y a ${diffD} j`;
}

function fmtAmount(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const STATUS_MAP: Record<
  string,
  { label: string; bg: string; text: string; dot: string; progress: number }
> = {
  todo: {
    label: "En attente",
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    progress: 5,
  },
  in_progress: {
    label: "En cours",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    progress: 50,
  },
  delivered: {
    label: "En revue",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    progress: 80,
  },
  approved: {
    label: "Validé",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    progress: 100,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div
      className="rounded-xl border p-[18px]"
      style={{
        background: "var(--surface-card)",
        borderColor: "var(--border-default)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-slate-500">{label}</span>
        <span
          className={`inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon size={16} strokeWidth={2} className={iconColor} />
        </span>
      </div>
      <div className="mt-2.5 text-[26px] font-bold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-0.5 text-[12px] text-slate-400">{sub}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.todo;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { user, workspace } = await requireAuth();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [clientList, projectList, fileList, messageList, invoiceList] =
    await Promise.all([
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
          and(
            eq(projects.workspaceId, workspace.id),
            isNull(projects.deletedAt),
          ),
        )
        .orderBy(desc(projects.updatedAt)),
      db
        .select()
        .from(files)
        .where(
          and(eq(files.workspaceId, workspace.id), isNull(files.deletedAt)),
        )
        .orderBy(desc(files.createdAt))
        .limit(20),
      db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.workspaceId, workspace.id),
            isNull(messages.deletedAt),
          ),
        )
        .orderBy(desc(messages.createdAt))
        .limit(20),
      db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.workspaceId, workspace.id),
            isNull(invoices.deletedAt),
          ),
        )
        .orderBy(desc(invoices.createdAt)),
    ]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const newClientsThisMonth = clientList.filter(
    (c) => c.createdAt >= startOfMonth,
  ).length;
  const inProgressCount = projectList.filter(
    (p) => p.status === "in_progress",
  ).length;
  const toValidateCount = projectList.filter(
    (p) => p.status === "delivered",
  ).length;
  const invoicedThisMonth = invoiceList
    .filter((inv) => inv.createdAt >= startOfMonth)
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoiceList
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingCount = invoiceList.filter(
    (inv) => inv.status === "pending",
  ).length;

  // ── Recent clients (last 5) ───────────────────────────────────────────────

  const projectsByClient = projectList.reduce<
    Record<string, typeof projectList>
  >((acc, p) => {
    (acc[p.clientId] ??= []).push(p);
    return acc;
  }, {});

  const recentClients = clientList.slice(0, 5).map((client) => {
    const cProjects = projectsByClient[client.id] ?? [];
    const latest = cProjects[0];
    const status = latest?.status ?? "todo";
    const badge = STATUS_MAP[status] ?? STATUS_MAP.todo;
    const when = relativeTime(latest?.updatedAt ?? client.createdAt);
    const av = getAvatar(client.name);
    return { client, latest, status, badge, when, av };
  });

  // ── Activity feed (last 5 events merged) ─────────────────────────────────

  const clientById = Object.fromEntries(clientList.map((c) => [c.id, c]));
  const projectById = Object.fromEntries(projectList.map((p) => [p.id, p]));

  type ActivityItem = {
    id: string;
    date: Date;
    icon: LucideIcon;
    iconColor: string;
    who: string;
    verb: string;
    what: string;
  };

  const activityItems: ActivityItem[] = [];

  for (const f of fileList) {
    const proj = projectById[f.projectId];
    const client = proj ? clientById[proj.clientId] : undefined;
    activityItems.push({
      id: `file-${f.id}`,
      date: f.createdAt,
      icon: Upload,
      iconColor: "text-slate-400",
      who:
        f.uploadedBy === "freelance" ? "Vous" : (client?.name ?? "Un client"),
      verb: f.uploadedBy === "freelance" ? "avez ajouté" : "a partagé",
      what: f.name,
    });
  }

  for (const m of messageList) {
    const proj = projectById[m.projectId];
    const client = proj ? clientById[proj.clientId] : undefined;
    const isFreelance = m.authorType === "freelance";
    activityItems.push({
      id: `msg-${m.id}`,
      date: m.createdAt,
      icon: isFreelance ? Send : MessageSquare,
      iconColor: isFreelance ? "text-indigo-500" : "text-slate-400",
      who: isFreelance ? "Vous" : (client?.name ?? "Un client"),
      verb: isFreelance ? "avez envoyé un message dans" : "a commenté",
      what: proj?.name ?? "",
    });
  }

  for (const inv of invoiceList) {
    activityItems.push({
      id: `inv-${inv.id}`,
      date: inv.createdAt,
      icon: Send,
      iconColor: "text-indigo-500",
      who: "Vous",
      verb: "avez envoyé la facture",
      what: inv.description,
    });
  }

  for (const c of clientList) {
    activityItems.push({
      id: `client-${c.id}`,
      date: c.createdAt,
      icon: UserPlus,
      iconColor: "text-indigo-500",
      who: c.name,
      verb: "a rejoint le portail",
      what: "",
    });
  }

  const recentActivity = activityItems
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  // ── Date label ────────────────────────────────────────────────────────────

  const dateLabel = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const firstName = user.fullName?.split(" ")[0] ?? user.email.split("@")[0];
  const isPro = user.subscriptionStatus === "active";

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="flex shrink-0 items-center justify-between gap-4 px-7 py-[18px]"
        style={{
          borderBottom: "1px solid var(--border-default)",
          background: "var(--surface-page)",
        }}
      >
        <div>
          <h1 className="text-[21px] font-bold tracking-tight text-slate-900">
            Bonjour, {firstName}
          </h1>
          <p className="mt-0.5 text-[13.5px] text-slate-500">
            {dateLabel} · voici l&apos;essentiel de vos missions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute left-[11px] text-slate-400"
            />
            <input
              placeholder="Rechercher un client, un livrable…"
              className="h-[38px] w-[260px] rounded-lg border pl-[34px] pr-3 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 transition-colors"
              style={{
                background: "var(--surface-card)",
                borderColor: "var(--border-default)",
              }}
            />
          </div>

          {isPro ? (
            <form action={createBillingPortalSession}>
              <button
                type="submit"
                className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Mon abonnement
              </button>
            </form>
          ) : (
            <a
              href="/pricing"
              className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Voir les plans
            </a>
          )}

          <InviteModal workspaceId={workspace.id} />
        </div>
      </div>

      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-7">
        {/* Stats grid */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <StatCard
            label="Clients actifs"
            value={String(clientList.length)}
            sub={
              newClientsThisMonth > 0
                ? `+${newClientsThisMonth} ce mois`
                : "aucun nouveau ce mois"
            }
            icon={Users}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
          />
          <StatCard
            label="Missions en cours"
            value={String(inProgressCount)}
            sub={
              toValidateCount > 0
                ? `${toValidateCount} à valider`
                : "aucune à valider"
            }
            icon={FolderOpen}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
          />
          <StatCard
            label="Facturé ce mois"
            value={invoicedThisMonth > 0 ? fmtAmount(invoicedThisMonth) : "—"}
            sub={`${invoiceList.filter((i) => i.createdAt >= startOfMonth).length} facture(s) ce mois`}
            icon={ReceiptEuro}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            label="En attente de paiement"
            value={pendingAmount > 0 ? fmtAmount(pendingAmount) : "—"}
            sub={
              pendingCount > 0
                ? `${pendingCount} facture${pendingCount > 1 ? "s" : ""}`
                : "tout est réglé"
            }
            icon={Wallet}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>

        {/* Two-column layout */}
        <div
          className="grid items-start gap-4"
          style={{ gridTemplateColumns: "1.55fr 1fr" }}
        >
          {/* Clients récents */}
          <div
            className="overflow-hidden rounded-xl border"
            style={{
              background: "var(--surface-card)",
              borderColor: "var(--border-default)",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="text-[14px] font-semibold text-slate-900">
                Clients récents
              </span>
              <span className="cursor-pointer text-[13px] font-semibold text-indigo-500 hover:text-indigo-600">
                Voir tous
              </span>
            </div>

            {recentClients.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13.5px] text-slate-400">
                Aucun client pour le moment.{" "}
                <span className="text-indigo-500">
                  Invitez votre premier client.
                </span>
              </div>
            ) : (
              recentClients.map(
                ({ client, latest, status, badge, when, av }) => (
                  <div
                    key={client.id}
                    className="flex items-center gap-3.5 px-5 py-3.5"
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <span
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
                      style={{
                        background: av.color,
                        boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)",
                      }}
                    >
                      {av.initials}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold text-slate-900">
                        {client.name}
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-slate-500">
                        {latest?.name ?? "Aucune mission"}
                      </div>
                      <div
                        className="mt-2 h-1.5 overflow-hidden rounded-full"
                        style={{
                          maxWidth: 240,
                          background: "var(--slate-100)",
                        }}
                      >
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Badge status={status} />
                      <span className="text-[12px] text-slate-400">{when}</span>
                    </div>
                  </div>
                ),
              )
            )}
          </div>

          {/* Activité récente */}
          <div
            className="overflow-hidden rounded-xl border"
            style={{
              background: "var(--surface-card)",
              borderColor: "var(--border-default)",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div
              className="px-5 py-4 text-[14px] font-semibold text-slate-900"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              Activité récente
            </div>

            {recentActivity.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13.5px] text-slate-400">
                Aucune activité récente.
              </div>
            ) : (
              <div className="p-2">
                {recentActivity.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-lg px-3 py-2.5"
                    >
                      <span
                        className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full"
                        style={{ background: "var(--surface-sunken)" }}
                      >
                        <Icon
                          size={15}
                          strokeWidth={2}
                          className={item.iconColor}
                        />
                      </span>
                      <div className="min-w-0 text-[13.5px] leading-snug">
                        <span className="font-semibold text-slate-900">
                          {item.who}
                        </span>{" "}
                        <span className="text-slate-500">{item.verb}</span>
                        {item.what && (
                          <>
                            {" "}
                            <span className="font-medium text-slate-900">
                              {item.what}
                            </span>
                          </>
                        )}
                        <div className="mt-0.5 text-[12px] text-slate-400">
                          {relativeTime(item.date)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
