"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ExternalLink,
  UserPlus,
  Trash2,
  Users,
  Check,
} from "lucide-react";
import InviteModal from "./InviteModal";
import { deleteClient, resendClientInvite } from "@/app/actions/client";

export type ClientRow = {
  id: string;
  name: string;
  email: string;
  projectCount: number;
  lastActivityISO: string;
  createdAtISO: string;
  firstAccessedAtISO: string | null;
  status: "Actif" | "Invité" | "Inactif";
  inviteToken: string | null;
};

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
  const initials =
    ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
  const color =
    AVATAR_PALETTE[(name.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
  return { initials, color };
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  const d = Math.floor(diffMs / 86_400_000);
  if (h < 1) return "il y a quelques minutes";
  if (h < 24) return `il y a ${h} h`;
  if (d === 1) return "hier";
  if (d < 7) return `il y a ${d} j`;
  return `il y a ${Math.floor(d / 7)} sem`;
}

function dateLabel(prefix: string, iso: string): string {
  return `${prefix} le ${new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  })}`;
}

const STATUS_STYLES: Record<string, { dot: string; bg: string; text: string }> =
  {
    Actif: { dot: "#10b981", bg: "#ecfdf5", text: "#059669" },
    Invité: { dot: "#f59e0b", bg: "#fffbeb", text: "#d97706" },
    Inactif: { dot: "#94a3b8", bg: "#f1f5f9", text: "#64748b" },
  };

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Inactif;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 9999,
        padding: "3px 10px",
        fontSize: 12.5,
        fontWeight: 600,
        background: s.bg,
        color: s.text,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}

type Tab = "tous" | "actifs" | "invites";

function TabBar({
  value,
  onChange,
  counts,
}: {
  value: Tab;
  onChange: (v: Tab) => void;
  counts: Record<Tab, number>;
}) {
  const tabs: { value: Tab; label: string }[] = [
    { value: "tous", label: "Tous" },
    { value: "actifs", label: "Actifs" },
    { value: "invites", label: "Invités" },
  ];
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 2,
        borderRadius: 8,
        padding: 3,
        background: "var(--surface-sunken)",
        border: "1px solid var(--border-default)",
      }}
    >
      {tabs.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            style={{
              appearance: "none",
              border: active
                ? "1px solid var(--border-default)"
                : "1px solid transparent",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 13.5,
              fontWeight: active ? 600 : 500,
              background: active ? "var(--surface-card)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              boxShadow: active ? "0 1px 2px rgba(15,23,42,0.06)" : "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              transition: "all 120ms",
            }}
          >
            {tab.label}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: active
                  ? "var(--text-secondary)"
                  : "var(--text-tertiary)",
                background: "var(--surface-sunken)",
                borderRadius: 9999,
                padding: "1px 7px",
                minWidth: 20,
                textAlign: "center",
              }}
            >
              {counts[tab.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ActionBtn({
  title,
  onClick,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        appearance: "none",
        border: "none",
        background: hover
          ? danger
            ? "var(--red-50)"
            : "var(--surface-sunken)"
          : "transparent",
        cursor: "pointer",
        width: 32,
        height: 32,
        borderRadius: 7,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: hover
          ? danger
            ? "var(--red-600)"
            : "var(--text-primary)"
          : "var(--slate-400)",
        transition: "background 120ms, color 120ms",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

interface Props {
  rows: ClientRow[];
  workspaceSlug: string;
  workspaceId: string;
}

const GRID_COLS = "minmax(0,1.7fr) minmax(0,1.4fr) 130px 160px 120px 120px";

export default function ClientsTable({
  rows: initialRows,
  workspaceSlug,
  workspaceId,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("tous");
  const [query, setQuery] = useState("");
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  const rows = initialRows.filter((r) => !deleted.has(r.id));
  const q = query.trim().toLowerCase();

  const filtered = rows.filter((r) => {
    const okTab =
      tab === "tous" ||
      (tab === "actifs" && r.status === "Actif") ||
      (tab === "invites" && r.status === "Invité");
    const okQ =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q);
    return okTab && okQ;
  });

  const counts: Record<Tab, number> = {
    tous: rows.length,
    actifs: rows.filter((r) => r.status === "Actif").length,
    invites: rows.filter((r) => r.status === "Invité").length,
  };

  function handleDelete(row: ClientRow) {
    setDeleted((prev) => new Set([...prev, row.id]));
    startTransition(async () => {
      await deleteClient(row.id);
      router.refresh();
      showToast(`${row.name} supprimé`);
    });
  }

  function handleInvite(row: ClientRow) {
    startTransition(async () => {
      const result = await resendClientInvite(row.id);
      showToast(result.error ?? `Invitation renvoyée à ${row.email}`);
    });
  }

  function handleView(row: ClientRow) {
    if (row.inviteToken) {
      window.open(
        `/portal/${workspaceSlug}?token=${row.inviteToken}`,
        "_blank",
      );
    } else {
      showToast("Aucun lien d'accès disponible pour ce client");
    }
  }

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 28px",
          borderBottom: "1px solid var(--border-default)",
          background: "var(--surface-page)",
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
              color: "var(--text-primary)",
            }}
          >
            Clients
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--text-secondary)",
              margin: "3px 0 0",
            }}
          >
            Gérez vos clients, leurs accès au portail et leurs missions.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search
              size={16}
              strokeWidth={2}
              style={{
                position: "absolute",
                left: 11,
                pointerEvents: "none",
                color: "var(--slate-400)",
              }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un client…"
              style={{
                height: 38,
                width: 240,
                padding: "0 12px 0 34px",
                borderRadius: 8,
                border: "1px solid var(--border-default)",
                background: "var(--surface-card)",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                outline: "none",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <InviteModal
            workspaceId={workspaceId}
            renderTrigger={(open) => (
              <button
                onClick={open}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--indigo-600)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 120ms",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--indigo-700)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--indigo-600)")
                }
              >
                <Plus size={16} strokeWidth={2} />
                Créer un client
              </button>
            )}
          />
        </div>
      </div>

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          padding: "24px 28px 28px",
        }}
      >
        {/* Tabs row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <TabBar value={tab} onChange={setTab} counts={counts} />
          <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
            {filtered.length} {filtered.length > 1 ? "clients" : "client"}
          </span>
        </div>

        {/* Table */}
        <div
          style={{
            minWidth: 860,
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}
        >
          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: GRID_COLS,
              padding: "11px 20px",
              borderBottom: "1px solid var(--border-default)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            <span>Client</span>
            <span>Email</span>
            <span>Projets actifs</span>
            <span>Dernière activité</span>
            <span>Statut</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {/* Rows */}
          {filtered.map((row) => {
            const av = getAvatar(row.name);
            const activityLabel =
              row.status === "Invité"
                ? dateLabel("Invité", row.createdAtISO)
                : row.status === "Actif" &&
                    !row.projectCount &&
                    row.firstAccessedAtISO
                  ? dateLabel("Connecté", row.firstAccessedAtISO)
                  : row.status === "Inactif"
                    ? "—"
                    : relativeTime(row.lastActivityISO);
            return (
              <div
                key={row.id}
                className="hover:bg-slate-50"
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID_COLS,
                  alignItems: "center",
                  padding: "13px 20px",
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background 120ms",
                }}
              >
                {/* Client cell */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: av.color,
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13,
                      boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)",
                    }}
                  >
                    {av.initials}
                  </span>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.name}
                  </div>
                </div>

                {/* Email */}
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.email}
                </span>

                {/* Projects */}
                <span>
                  {row.projectCount > 0 ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "var(--indigo-500)",
                          flexShrink: 0,
                        }}
                      />
                      {row.projectCount}
                    </span>
                  ) : (
                    <span
                      style={{ fontSize: 13.5, color: "var(--text-tertiary)" }}
                    >
                      —
                    </span>
                  )}
                </span>

                {/* Last activity */}
                <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                  {activityLabel}
                </span>

                {/* Status */}
                <span>
                  <StatusBadge status={row.status} />
                </span>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 4,
                  }}
                >
                  <ActionBtn
                    title="Voir le portail"
                    onClick={() => handleView(row)}
                  >
                    <ExternalLink size={17} strokeWidth={2} />
                  </ActionBtn>
                  <ActionBtn
                    title="Renvoyer l'invitation"
                    onClick={() => handleInvite(row)}
                  >
                    <UserPlus size={17} strokeWidth={2} />
                  </ActionBtn>
                  <ActionBtn
                    title="Supprimer"
                    danger
                    onClick={() => handleDelete(row)}
                  >
                    <Trash2 size={17} strokeWidth={2} />
                  </ActionBtn>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "64px 20px",
              }}
            >
              <Users
                size={30}
                strokeWidth={1.5}
                style={{ color: "var(--slate-300)" }}
              />
              <span style={{ fontSize: 14.5, color: "var(--text-tertiary)" }}>
                {q
                  ? "Aucun client ne correspond à votre recherche."
                  : "Aucun client pour le moment."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px 16px",
            background: "var(--slate-900)",
            color: "#fff",
            borderRadius: 10,
            boxShadow: "var(--shadow-lg)",
            fontSize: 13.5,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          <Check
            size={16}
            strokeWidth={2}
            style={{ color: "var(--indigo-300)", flexShrink: 0 }}
          />
          {toast}
        </div>
      )}
    </>
  );
}
