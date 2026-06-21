"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Folder,
  Calendar,
  MoreHorizontal,
  List,
  LayoutGrid,
  ChevronDown,
  X,
  FolderOpen,
  Trash2,
} from "lucide-react";
import {
  createProject,
  updateProjectStatus,
  deleteProject,
} from "@/app/actions/projects";
import {
  STATUSES,
  STATUS_LABELS,
  STATUS_TONE,
  TONE_STYLE,
  type Tone,
} from "@/lib/project-statuses";
import InlineStatusSelect from "@/components/ui/InlineStatusSelect";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectRow = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: string;
  updatedAtISO: string;
};

type ClientOption = { id: string; name: string };

interface Props {
  rows: ProjectRow[];
  clients: ClientOption[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvatar(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
  const color =
    AVATAR_PALETTE[(name.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
  return { initials, color };
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({
  status,
  size = "md",
}: {
  status: string;
  size?: "sm" | "md";
}) {
  const tone = STATUS_TONE[status] ?? "neutral";
  const s = TONE_STYLE[tone];
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size === "sm" ? 5 : 6,
        fontSize: size === "sm" ? 11.5 : 12.5,
        fontWeight: 600,
        lineHeight: 1,
        padding: size === "sm" ? "4px 9px" : "5px 10px",
        borderRadius: 9999,
        background: s.bg,
        color: s.fg,
      }}
    >
      <span
        style={{
          width: size === "sm" ? 5 : 6,
          height: size === "sm" ? 5 : 6,
          borderRadius: 9999,
          flexShrink: 0,
          background: s.dot,
        }}
      />
      {label}
    </span>
  );
}

// ─── Create project modal ─────────────────────────────────────────────────────

function CreateProjectModal({
  clients,
  onClose,
}: {
  clients: ClientOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await createProject(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
        onClose();
      }
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(15,23,42,0.32)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 440,
          maxWidth: "100%",
          borderRadius: 16,
          border: "1px solid var(--border-default)",
          background: "var(--surface-card)",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "22px 24px 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--indigo-50)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Folder
                size={20}
                strokeWidth={2}
                style={{ color: "var(--indigo-600)" }}
              />
            </span>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "var(--text-primary)",
                }}
              >
                Nouveau projet
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginTop: 1,
                }}
              >
                Associez un projet à l'un de vos clients.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              appearance: "none",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--slate-400)",
              display: "inline-flex",
              padding: 4,
              marginTop: 2,
            }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: "8px 24px",
            }}
          >
            {error && (
              <p
                style={{
                  margin: 0,
                  padding: "9px 12px",
                  background: "var(--red-50)",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  fontSize: 13.5,
                  color: "#dc2626",
                }}
              >
                {error}
              </p>
            )}

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Client
              </span>
              <div style={{ position: "relative" }}>
                <select
                  name="clientId"
                  required
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 36px 0 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border-default)",
                    background: "var(--surface-card)",
                    fontSize: 14,
                    fontFamily: "var(--font-sans)",
                    color: "var(--text-primary)",
                    appearance: "none",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  style={{
                    position: "absolute",
                    right: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "var(--slate-400)",
                  }}
                />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Nom du projet
              </span>
              <input
                name="name"
                type="text"
                required
                placeholder="Refonte du site vitrine"
                style={{
                  height: 40,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-default)",
                  background: "var(--surface-card)",
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Description{" "}
                <span
                  style={{ fontWeight: 400, color: "var(--text-tertiary)" }}
                >
                  (optionnel)
                </span>
              </span>
              <textarea
                name="description"
                rows={2}
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-default)",
                  background: "var(--surface-card)",
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  color: "var(--text-primary)",
                  outline: "none",
                  resize: "none",
                }}
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              padding: "16px 24px 22px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: 8,
                border: "1px solid var(--border-default)",
                background: "var(--surface-card)",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending || clients.length === 0}
              style={{
                height: 40,
                padding: "0 16px",
                borderRadius: 8,
                border: "none",
                background: "var(--indigo-600)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending || clients.length === 0 ? 0.5 : 1,
              }}
            >
              {isPending ? "Création…" : "Créer le projet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Table view ───────────────────────────────────────────────────────────────

const TABLE_COLS = "1fr 210px 150px 180px 44px";

function TableRow({
  project: p,
  onDelete,
}: {
  project: ProjectRow;
  onDelete: (id: string, name: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const av = getAvatar(p.clientName);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: TABLE_COLS,
        alignItems: "center",
        padding: "13px 20px",
        borderTop: "1px solid var(--border-subtle)",
        background: hover ? "var(--surface-sunken)" : "transparent",
        transition: "background 120ms",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
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
            width: 34,
            height: 34,
            borderRadius: 8,
            flexShrink: 0,
            background: "var(--indigo-50)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--indigo-600)",
          }}
        >
          <Folder size={17} strokeWidth={2} />
        </span>
        <Link
          href={`/projets/${p.id}`}
          style={{
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          {p.name}
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          minWidth: 0,
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 9999,
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 10.5,
            fontWeight: 600,
            background: av.color,
          }}
        >
          {av.initials}
        </span>
        <span
          style={{
            fontSize: 13.5,
            color: "var(--text-secondary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {p.clientName}
        </span>
      </div>

      <span>
        <InlineStatusSelect projectId={p.id} status={p.status} />
      </span>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          fontSize: 13,
          color: "var(--text-tertiary)",
        }}
      >
        <Calendar size={14} strokeWidth={2} />
        {fmtDate(p.updatedAtISO)}
      </span>

      <span style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => onDelete(p.id, p.name)}
          title="Supprimer le projet"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 6,
            color: hover ? "var(--red-500)" : "var(--slate-400)",
            display: "flex",
            alignItems: "center",
            transition: "color 120ms",
          }}
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </span>
    </div>
  );
}

function TableView({
  rows,
  onDelete,
}: {
  rows: ProjectRow[];
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: 12,
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: TABLE_COLS,
          padding: "11px 20px",
          borderBottom: "1px solid var(--border-default)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        <span>Projet</span>
        <span>Client</span>
        <span>Statut</span>
        <span>Dernière mise à jour</span>
        <span />
      </div>

      {rows.map((p) => (
        <TableRow key={p.id} project={p} onDelete={onDelete} />
      ))}

      {rows.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "56px 20px",
          }}
        >
          <FolderOpen
            size={28}
            strokeWidth={1.5}
            style={{ color: "var(--slate-300)" }}
          />
          <span style={{ fontSize: 14, color: "var(--text-tertiary)" }}>
            Aucun projet ne correspond à ces filtres
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Kanban view ──────────────────────────────────────────────────────────────

function KanbanCard({
  project: p,
  onDelete,
}: {
  project: ProjectRow;
  onDelete: (id: string, name: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const av = getAvatar(p.clientName);

  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: 12,
        padding: 14,
        boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 11,
        cursor: "pointer",
        transform: hover ? "translateY(-2px)" : "none",
        transition: "box-shadow 160ms, transform 160ms",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Link
          href={`/projets/${p.id}`}
          style={{
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.35,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          {p.name}
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(p.id, p.name);
          }}
          title="Supprimer le projet"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "3px 5px",
            borderRadius: 5,
            color: "var(--slate-400)",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 9999,
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            background: av.color,
          }}
        >
          {av.initials}
        </span>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {p.clientName}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: 10,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--text-tertiary)",
          }}
        >
          <Calendar size={13} strokeWidth={2} />
          {fmtDate(p.updatedAtISO)}
        </span>
        <InlineStatusSelect projectId={p.id} status={p.status} />
      </div>
    </div>
  );
}

function KanbanView({
  rows,
  onDelete,
}: {
  rows: ProjectRow[];
  onDelete: (id: string, name: string) => void;
}) {
  const columns = STATUSES.map((status) => {
    const tone = STATUS_TONE[status] ?? "neutral";
    const items = rows.filter((p) => p.status === status);
    return {
      status,
      label: STATUS_LABELS[status] ?? status,
      dot: TONE_STYLE[tone].dot,
      items,
    };
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        alignItems: "start",
      }}
    >
      {columns.map((col) => (
        <div
          key={col.status}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 2px 2px",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                flexShrink: 0,
                background: col.dot,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{col.label}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-tertiary)",
                background: "var(--surface-card)",
                border: "1px solid var(--border-default)",
                borderRadius: 9999,
                padding: "1px 8px",
                lineHeight: 1.5,
              }}
            >
              {col.items.length}
            </span>
          </div>

          {col.items.map((p) => (
            <KanbanCard key={p.id} project={p} onDelete={onDelete} />
          ))}

          {col.items.length === 0 && (
            <div
              style={{
                border: "1px dashed var(--border-strong)",
                borderRadius: 12,
                padding: 20,
                textAlign: "center",
                fontSize: 12.5,
                color: "var(--text-tertiary)",
              }}
            >
              Aucun projet
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectsView({ rows: initialRows, clients }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleted, setDeleted] = useState<Set<string>>(new Set());

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Supprimer le projet "${name}" ?`)) return;
    setDeleted((prev) => new Set([...prev, id]));
    startTransition(async () => {
      await deleteProject(id);
      router.refresh();
    });
  }

  const rows = initialRows.filter((r) => !deleted.has(r.id));

  const uniqueClients = Array.from(
    new Set(rows.map((r) => r.clientName)),
  ).sort();

  const byClient =
    clientFilter === "all"
      ? rows
      : rows.filter((p) => p.clientName === clientFilter);

  const filtered = byClient.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const q = query.trim().toLowerCase();
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q);
    return matchStatus && matchQ;
  });

  const countByStatus: Record<string, number> = {};
  byClient.forEach((p) => {
    countByStatus[p.status] = (countByStatus[p.status] ?? 0) + 1;
  });

  const chipDefs = [
    { key: "all", label: "Tous" },
    ...STATUSES.map((s) => ({ key: s, label: STATUS_LABELS[s] ?? s })),
  ];

  const totalProjects = rows.length;
  const totalClients = new Set(rows.map((p) => p.clientId)).size;

  return (
    <>
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
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
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
              }}
            >
              Projets
            </h1>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--text-secondary)",
                margin: "3px 0 0",
              }}
            >
              {totalProjects} projet{totalProjects !== 1 ? "s" : ""} ·{" "}
              {totalClients} client{totalClients !== 1 ? "s" : ""}
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
                placeholder="Rechercher un projet…"
                style={{
                  height: 38,
                  width: 230,
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
            <button
              onClick={() => setShowModal(true)}
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
              Nouveau projet
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "14px 28px",
            borderBottom: "1px solid var(--border-default)",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {chipDefs.map((chip) => {
              const active = statusFilter === chip.key;
              const count =
                chip.key === "all"
                  ? byClient.length
                  : (countByStatus[chip.key] ?? 0);
              return (
                <button
                  key={chip.key}
                  onClick={() => setStatusFilter(chip.key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    height: 34,
                    padding: "0 13px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 500,
                    border: `1px solid ${active ? "var(--indigo-200)" : "var(--border-default)"}`,
                    background: active
                      ? "var(--color-primary-subtle)"
                      : "var(--surface-card)",
                    color: active
                      ? "var(--indigo-700)"
                      : "var(--text-secondary)",
                    transition: "all 120ms",
                  }}
                >
                  {chip.label}
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      lineHeight: 1,
                      padding: "2px 6px",
                      borderRadius: 9999,
                      background: active
                        ? "rgba(99,102,241,0.14)"
                        : "var(--surface-sunken)",
                      color: active
                        ? "var(--indigo-700)"
                        : "var(--text-tertiary)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Client filter */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                style={{
                  appearance: "none",
                  height: 38,
                  padding: "0 36px 0 13px",
                  borderRadius: 8,
                  border: "1px solid var(--border-default)",
                  background: "var(--surface-card)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all">Tous les clients</option>
                {uniqueClients.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                style={{
                  position: "absolute",
                  right: 12,
                  pointerEvents: "none",
                  color: "var(--slate-400)",
                }}
              />
            </div>

            {/* View toggle */}
            <div
              style={{
                display: "inline-flex",
                background: "var(--surface-sunken)",
                border: "1px solid var(--border-default)",
                borderRadius: 8,
                padding: 3,
                gap: 3,
              }}
            >
              {(["table", "kanban"] as const).map((v) => {
                const active = view === v;
                return (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      height: 32,
                      padding: "0 13px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      fontSize: 13.5,
                      fontWeight: 600,
                      background: active
                        ? "var(--surface-card)"
                        : "transparent",
                      color: active
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                      boxShadow: active
                        ? "0 1px 2px rgba(15,23,42,0.06)"
                        : "none",
                      transition: "all 120ms",
                    }}
                  >
                    {v === "table" ? (
                      <List size={15} strokeWidth={2} />
                    ) : (
                      <LayoutGrid size={15} strokeWidth={2} />
                    )}
                    {v === "table" ? "Tableau" : "Kanban"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 28,
            background: "var(--surface-sunken)",
          }}
        >
          {view === "table" ? (
            <TableView rows={filtered} onDelete={handleDelete} />
          ) : (
            <KanbanView rows={filtered} onDelete={handleDelete} />
          )}
        </div>
      </div>

      {showModal && (
        <CreateProjectModal
          clients={clients}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
