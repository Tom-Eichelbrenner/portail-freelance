"use client";

import { useActionState, useEffect, useState } from "react";
import {
  ReceiptEuro,
  Plus,
  ExternalLink,
  X,
  MoreHorizontal,
} from "lucide-react";
import { createInvoice, type InvoiceState } from "@/app/actions/stripe";

interface InvoiceItem {
  id: string;
  num: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  stripePaymentLinkUrl: string;
  createdAtISO: string;
}

interface Props {
  projectId: string;
  clientId: string;
  invoices: InvoiceItem[];
  isPro: boolean;
}

const STATUS_STYLE: Record<
  string,
  { bg: string; fg: string; dot: string; label: string }
> = {
  pending: {
    bg: "var(--amber-50)",
    fg: "var(--amber-600)",
    dot: "var(--amber-500)",
    label: "En attente",
  },
  paid: {
    bg: "var(--emerald-50)",
    fg: "var(--emerald-700)",
    dot: "var(--emerald-500)",
    label: "Payée",
  },
  late: {
    bg: "var(--red-50)",
    fg: "var(--red-600)",
    dot: "var(--red-500)",
    label: "En retard",
  },
};

function fmtAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

const GRID = "150px 1fr 130px 120px 36px";
const INIT: InvoiceState = { error: null, success: null };

export default function ProjectInvoiceSection({
  projectId,
  invoices,
  isPro,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(createInvoice, INIT);

  useEffect(() => {
    if (state.success) setShowForm(false);
  }, [state.success]);

  return (
    <section
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ReceiptEuro size={18} strokeWidth={1.8} color="var(--indigo-500)" />
          <span style={{ fontSize: 15, fontWeight: 600 }}>Factures</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-tertiary)",
              background: "var(--surface-sunken)",
              padding: "2px 9px",
              borderRadius: 9999,
            }}
          >
            {invoices.length}
          </span>
        </div>
        {isPro && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 32,
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 600,
              background: "var(--indigo-600)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Créer une facture
          </button>
        )}
      </div>

      {/* Column headers */}
      {invoices.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            gap: 12,
            padding: "11px 20px",
            borderBottom: "1px solid var(--border-default)",
            fontSize: 11.5,
            fontWeight: 600,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <span>Numéro</span>
          <span>Description</span>
          <span>Statut</span>
          <span>Date</span>
          <span />
        </div>
      )}

      {/* Rows */}
      {invoices.length === 0 ? (
        <div
          style={{
            padding: "32px 20px",
            textAlign: "center",
            fontSize: 13.5,
            color: "var(--text-tertiary)",
          }}
        >
          Aucune facture pour ce projet
        </div>
      ) : (
        invoices.map((inv) => {
          const s = STATUS_STYLE[inv.status] ?? STATUS_STYLE.pending;
          return (
            <div
              key={inv.id}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                gap: 12,
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {inv.num}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {fmtAmount(inv.amount, inv.currency)}
              </span>
              <span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12.5,
                    fontWeight: 600,
                    padding: "5px 10px",
                    borderRadius: 9999,
                    background: s.bg,
                    color: s.fg,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 9999,
                      background: s.dot,
                      flexShrink: 0,
                    }}
                  />
                  {s.label}
                </span>
              </span>
              <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                {fmtDate(inv.createdAtISO)}
              </span>
              <span
                style={{ display: "inline-flex", justifyContent: "flex-end" }}
              >
                {inv.stripePaymentLinkUrl ? (
                  <a
                    href={inv.stripePaymentLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--slate-400)",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Voir le lien de paiement"
                  >
                    <ExternalLink size={15} strokeWidth={2} />
                  </a>
                ) : (
                  <MoreHorizontal
                    size={17}
                    strokeWidth={1.8}
                    color="var(--slate-400)"
                  />
                )}
              </span>
            </div>
          );
        })
      )}

      {/* Create invoice form */}
      {showForm && (
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border-default)",
          }}
        >
          <form
            action={formAction}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <input type="hidden" name="projectId" value={projectId} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                Nouvelle facture
              </span>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--slate-400)",
                  display: "flex",
                  padding: 2,
                }}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 5,
                  }}
                >
                  Description
                </label>
                <input
                  name="description"
                  required
                  placeholder="Ex : Design UI — Sprint 2"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: 13.5,
                    border: "1px solid var(--border-default)",
                    borderRadius: 8,
                    background: "var(--surface-sunken)",
                    color: "var(--text-primary)",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "var(--font-sans)",
                  }}
                />
              </div>
              <div style={{ width: 110 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 5,
                  }}
                >
                  Montant (€)
                </label>
                <input
                  name="amount"
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="500"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: 13.5,
                    border: "1px solid var(--border-default)",
                    borderRadius: 8,
                    background: "var(--surface-sunken)",
                    color: "var(--text-primary)",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "var(--font-sans)",
                  }}
                />
              </div>
            </div>
            {state.error && (
              <p style={{ fontSize: 13, color: "var(--red-600)", margin: 0 }}>
                {state.error}
              </p>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  padding: "8px 18px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  background: "var(--indigo-600)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: isPending ? "default" : "pointer",
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? "Création…" : "Créer"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "8px 14px",
                  fontSize: 13.5,
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
