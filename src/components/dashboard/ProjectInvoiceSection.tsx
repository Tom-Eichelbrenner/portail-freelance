"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, ExternalLink, X } from "lucide-react";
import { createInvoice, type InvoiceState } from "@/app/actions/stripe";

interface InvoiceItem {
  id: string;
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
  statusLabels: Record<string, string>;
}

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> =
  {
    pending: {
      bg: "var(--amber-50)",
      fg: "var(--amber-700)",
      label: "En attente",
    },
    paid: { bg: "var(--emerald-50)", fg: "var(--emerald-700)", label: "Payée" },
    late: { bg: "var(--red-50)", fg: "var(--red-600)", label: "En retard" },
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
    year: "numeric",
  });
}

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
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: 12,
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}
    >
      {/* List */}
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
        <div>
          {invoices.map((inv) => {
            const s = STATUS_STYLE[inv.status] ?? STATUS_STYLE.pending;
            return (
              <div
                key={inv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "13px 18px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {inv.description}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--text-tertiary)",
                      marginTop: 2,
                    }}
                  >
                    {fmtDate(inv.createdAtISO)}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {fmtAmount(inv.amount, inv.currency)}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 9999,
                      padding: "3px 9px",
                      background: s.bg,
                      color: s.fg,
                    }}
                  >
                    {s.label}
                  </span>
                  <a
                    href={inv.stripePaymentLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Voir le lien de paiement"
                    style={{
                      color: "var(--slate-400)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ExternalLink size={15} strokeWidth={2} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {isPro && (
        <div
          style={{
            padding: "12px 18px",
            borderTop:
              invoices.length > 0
                ? "1px solid var(--border-default)"
                : undefined,
          }}
        >
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--indigo-600)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              <Plus size={16} strokeWidth={2} />
              Créer une facture
            </button>
          ) : (
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
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
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
          )}
        </div>
      )}
    </div>
  );
}
