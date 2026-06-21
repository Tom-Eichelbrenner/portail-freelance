"use client";

import { useState, useActionState, useEffect } from "react";
import {
  Search,
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  ReceiptEuro,
  FileSearch,
  X,
} from "lucide-react";
import { createInvoice, type InvoiceState } from "@/app/actions/stripe";

const initialInvoiceState: InvoiceState = { error: null, success: null };

export type InvoiceRow = {
  id: string;
  num: string;
  clientName: string;
  clientInitials: string;
  projectName: string;
  amountCents: number;
  status: "paid" | "pending" | "late";
  createdAtISO: string;
};

type FilterKey = "toutes" | "payees" | "attente" | "retard";

const TABS: { key: FilterKey; label: string }[] = [
  { key: "toutes", label: "Toutes" },
  { key: "payees", label: "Payées" },
  { key: "attente", label: "En attente" },
  { key: "retard", label: "En retard" },
];

const GRID = "130px minmax(140px,1.3fr) minmax(150px,1.4fr) 100px 120px 80px";

function fmt(cents: number): string {
  const euros = cents / 100;
  return euros.toLocaleString("fr-FR", { minimumFractionDigits: 0 }) + " €";
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function statusLabel(status: InvoiceRow["status"]) {
  if (status === "paid") return "Payée";
  if (status === "late") return "En retard";
  return "En attente";
}

function StatusBadge({ status }: { status: InvoiceRow["status"] }) {
  const config = {
    paid: {
      bg: "var(--emerald-50)",
      dot: "var(--emerald-500)",
      text: "var(--emerald-700)",
      label: "Payée",
    },
    pending: {
      bg: "var(--amber-50)",
      dot: "var(--amber-400)",
      text: "var(--amber-700)",
      label: "En attente",
    },
    late: {
      bg: "var(--red-50)",
      dot: "var(--red-500)",
      text: "var(--red-700)",
      label: "En retard",
    },
  }[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px",
        borderRadius: 9999,
        background: config.bg,
        fontSize: 12.5,
        fontWeight: 600,
        color: config.text,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: config.dot,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}

function SumCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: 12,
        boxShadow: "var(--shadow-sm)",
        padding: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {label}
        </span>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: iconBg,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
          }}
        >
          {icon}
        </span>
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginTop: 10,
          color: valueColor ?? "var(--text-primary)",
        }}
      >
        {value}
      </div>
      <div
        style={{ fontSize: 12.5, color: "var(--text-tertiary)", marginTop: 4 }}
      >
        {sub}
      </div>
    </div>
  );
}

type ProjectOption = { id: string; name: string };

function CreateInvoiceModal({
  projects,
  onClose,
}: {
  projects: ProjectOption[];
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    createInvoice,
    initialInvoiceState,
  );

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onClose, 1200);
      return () => clearTimeout(t);
    }
  }, [state.success, onClose]);

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
              <ReceiptEuro
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
                Nouvelle facture
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginTop: 1,
                }}
              >
                Créez et envoyez une facture par email.
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

        <form action={formAction}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: "8px 24px",
            }}
          >
            {state.error && (
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
                {state.error}
              </p>
            )}
            {state.success && (
              <p
                style={{
                  margin: 0,
                  padding: "9px 12px",
                  background: "var(--emerald-50)",
                  border: "1px solid #6ee7b7",
                  borderRadius: 8,
                  fontSize: 13.5,
                  color: "var(--emerald-700)",
                }}
              >
                {state.success}
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
                Projet
              </span>
              <select
                name="projectId"
                required
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-default)",
                  background: "var(--surface-card)",
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  color: "var(--text-primary)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">Sélectionner un projet</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Montant (€)
              </span>
              <input
                name="amount"
                type="number"
                min={1}
                step={1}
                required
                placeholder="1500"
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
                Description
              </span>
              <input
                name="description"
                type="text"
                required
                placeholder="Développement site vitrine — Juin 2026"
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
                fontFamily: "var(--font-sans)",
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending || projects.length === 0}
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
                opacity: isPending || projects.length === 0 ? 0.5 : 1,
                fontFamily: "var(--font-sans)",
              }}
            >
              {isPending ? "Envoi…" : "Créer et envoyer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface Props {
  rows: InvoiceRow[];
  projects: ProjectOption[];
  isPro: boolean;
}

export default function InvoicesTable({ rows, projects, isPro }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("toutes");
  const [showModal, setShowModal] = useState(false);

  const q = query.trim().toLowerCase();

  const matchFilter = (row: InvoiceRow) => {
    if (filter === "payees") return row.status === "paid";
    if (filter === "attente") return row.status === "pending";
    if (filter === "retard") return row.status === "late";
    return true;
  };

  const matchQuery = (row: InvoiceRow) =>
    !q ||
    row.num.toLowerCase().includes(q) ||
    row.clientName.toLowerCase().includes(q) ||
    row.projectName.toLowerCase().includes(q);

  const visible = rows.filter((r) => matchFilter(r) && matchQuery(r));

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const paidJune = rows.filter((r) => {
    if (r.status !== "paid") return false;
    const d = new Date(r.createdAtISO);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const pending = rows.filter((r) => r.status === "pending");
  const late = rows.filter((r) => r.status === "late");

  const sum = (arr: InvoiceRow[]) => arr.reduce((a, b) => a + b.amountCents, 0);
  const totalShown = sum(visible);

  const tabCount = (k: FilterKey) => {
    if (k === "payees") return rows.filter((r) => r.status === "paid").length;
    if (k === "attente") return pending.length;
    if (k === "retard") return late.length;
    return rows.length;
  };

  const shownLabel =
    visible.length +
    (visible.length > 1 ? " factures affichées" : " facture affichée");

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
            Factures
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--text-secondary)",
              margin: "3px 0 0",
            }}
          >
            Suivez vos factures et vos encaissements en un coup d&apos;œil.
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
              placeholder="Rechercher une facture…"
              style={{
                height: 40,
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
          <button
            onClick={() => setShowModal(true)}
            disabled={!isPro}
            title={isPro ? undefined : "Fonctionnalité réservée au plan Pro"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              height: 40,
              padding: "0 16px",
              border: "none",
              borderRadius: 8,
              background: "var(--indigo-500)",
              color: "#fff",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 600,
              cursor: isPro ? "pointer" : "not-allowed",
              opacity: isPro ? 1 : 0.5,
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <Plus size={16} strokeWidth={2} />
            Créer une facture
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: "auto", padding: "28px" }}>
        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <SumCard
            label="Encaissé ce mois"
            value={fmt(sum(paidJune))}
            sub={`${paidJune.length} facture${paidJune.length > 1 ? "s" : ""} payée${paidJune.length > 1 ? "s" : ""} ce mois`}
            icon={<TrendingUp size={16} strokeWidth={2} />}
            iconBg="var(--emerald-50)"
            iconColor="var(--emerald-500)"
            valueColor="var(--emerald-600)"
          />
          <SumCard
            label="En attente"
            value={fmt(sum(pending))}
            sub={`${pending.length} en attente de paiement`}
            icon={<Clock size={16} strokeWidth={2} />}
            iconBg="var(--amber-50)"
            iconColor="var(--amber-500)"
          />
          <SumCard
            label="En retard"
            value={fmt(sum(late))}
            sub={`${late.length} facture${late.length > 1 ? "s" : ""} à relancer`}
            icon={<AlertCircle size={16} strokeWidth={2} />}
            iconBg="var(--red-50)"
            iconColor="var(--red-500)"
          />
          <SumCard
            label="Total facturé"
            value={fmt(sum(rows))}
            sub={`${rows.length} facture${rows.length > 1 ? "s" : ""} émises`}
            icon={<ReceiptEuro size={16} strokeWidth={2} />}
            iconBg="var(--slate-100)"
            iconColor="var(--slate-600)"
          />
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 2,
            marginBottom: 16,
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          {TABS.map(({ key, label }) => {
            const active = filter === key;
            const count = tabCount(key);
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  appearance: "none",
                  border: "none",
                  borderBottom: active
                    ? "2px solid var(--indigo-500)"
                    : "2px solid transparent",
                  background: "transparent",
                  padding: "9px 14px",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--indigo-600)" : "var(--text-secondary)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: -1,
                  transition: "color 120ms",
                }}
              >
                {label}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: active
                      ? "var(--indigo-500)"
                      : "var(--text-tertiary)",
                    background: active
                      ? "var(--indigo-50)"
                      : "var(--surface-sunken)",
                    borderRadius: 9999,
                    padding: "1px 7px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              padding: "11px 20px",
              borderBottom: "1px solid var(--border-default)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            <span>Numéro</span>
            <span>Client</span>
            <span>Projet</span>
            <span>Montant</span>
            <span>Statut</span>
            <span>Date</span>
          </div>

          {/* Data rows */}
          {visible.map((row) => (
            <div
              key={row.id}
              className="hover:bg-slate-50"
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                cursor: "pointer",
                transition: "background 120ms",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-primary)",
                }}
              >
                {row.num}
              </span>

              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--indigo-50)",
                    color: "var(--indigo-700)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: 11.5,
                    flexShrink: 0,
                  }}
                >
                  {row.clientInitials}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {row.clientName}
                </span>
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
                {row.projectName}
              </span>

              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {fmt(row.amountCents)}
              </span>

              <span>
                <StatusBadge status={row.status} />
              </span>

              <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                {fmtDate(row.createdAtISO)}
              </span>
            </div>
          ))}

          {/* Empty state */}
          {visible.length === 0 && (
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
              <FileSearch
                size={30}
                strokeWidth={1.5}
                style={{ color: "var(--slate-300)" }}
              />
              <span style={{ fontSize: 14.5, color: "var(--text-tertiary)" }}>
                {q
                  ? "Aucune facture ne correspond à votre recherche."
                  : "Aucune facture dans cette catégorie."}
              </span>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "13px 20px",
              background: "var(--surface-sunken)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {shownLabel}
            </span>
            <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
              Total affiché&nbsp;:{" "}
              <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                {fmt(totalShown)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {showModal && (
        <CreateInvoiceModal
          projects={projects}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
