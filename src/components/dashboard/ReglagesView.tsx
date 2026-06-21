"use client";

import { useActionState, useState, useRef, useTransition } from "react";
import { Check, Calendar, Lock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { saveSettings, deleteAccount } from "@/app/actions/settings";

const ACCENTS = [
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#10b981", name: "Émeraude" },
  { hex: "#f59e0b", name: "Ambre" },
  { hex: "#0ea5e9", name: "Ciel" },
  { hex: "#8b5cf6", name: "Violet" },
  { hex: "#ec4899", name: "Rose" },
];

const PLAN_DATA: Record<
  string,
  {
    name: string;
    price: string;
    cycle: string;
    renew: string | null;
    feats: string[];
    primaryCta: string;
    badgeBg: string;
    badgeFg: string;
    badgeDot: string;
    status: string;
  }
> = {
  pro: {
    name: "Pro",
    price: "24 €",
    cycle: "par mois, facturé annuellement",
    renew: "12 juillet 2026",
    feats: [
      "Clients illimités",
      "100 Go de stockage",
      "Relances automatiques",
      "Signature électronique",
    ],
    primaryCta: "Gérer l'abonnement",
    badgeBg: "var(--emerald-50)",
    badgeFg: "var(--emerald-700)",
    badgeDot: "var(--emerald-500)",
    status: "Actif",
  },
  team: {
    name: "Team",
    price: "49 €",
    cycle: "par utilisateur, facturé annuellement",
    renew: "12 juillet 2026",
    feats: [
      "Tout le plan Pro",
      "Espaces partagés",
      "Rôles et permissions",
      "Support prioritaire",
    ],
    primaryCta: "Gérer l'abonnement",
    badgeBg: "var(--emerald-50)",
    badgeFg: "var(--emerald-700)",
    badgeDot: "var(--emerald-500)",
    status: "Actif",
  },
};

const FREE_PLAN = {
  name: "Gratuit",
  price: "0 €",
  cycle: "pour toujours",
  renew: null,
  feats: ["3 clients", "5 Go de stockage", "Livrables et factures"],
  primaryCta: "Passer au plan Pro",
  badgeBg: "var(--slate-100)",
  badgeFg: "var(--slate-600)",
  badgeDot: "var(--slate-400)",
  status: "Plan actuel",
};

const NOTIF_DEFS = [
  {
    key: "newDeliverable" as const,
    title: "Livrable validé",
    desc: "Quand un client valide ou commente un livrable.",
  },
  {
    key: "comments" as const,
    title: "Nouveaux messages",
    desc: "Quand un client vous répond dans une mission.",
  },
  {
    key: "invoicePaid" as const,
    title: "Facture payée",
    desc: "Quand un paiement est reçu via Stripe.",
  },
  {
    key: "weeklyDigest" as const,
    title: "Récapitulatif hebdomadaire",
    desc: "Un résumé de votre activité chaque lundi.",
  },
  {
    key: "productUpdates" as const,
    title: "Nouveautés Livra",
    desc: "Les nouvelles fonctionnalités, au maximum une fois par mois.",
  },
];

type NotifKey = (typeof NOTIF_DEFS)[number]["key"];

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: 40,
        height: 24,
        borderRadius: 9999,
        border: "none",
        cursor: "pointer",
        padding: 0,
        position: "relative",
        flexShrink: 0,
        background: checked ? "var(--indigo-500)" : "var(--slate-200)",
        transition: "background 150ms",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 19 : 3,
          width: 18,
          height: 18,
          borderRadius: 9999,
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 150ms",
        }}
      />
    </button>
  );
}

export interface ReglagesProps {
  userName: string;
  userEmail: string;
  workspaceName: string;
  workspaceSlug: string;
  accentColor: string;
  subscriptionPlan: string | null;
}

export default function ReglagesView({
  userName,
  userEmail,
  workspaceName: initialWorkspaceName,
  workspaceSlug,
  accentColor: initialAccentColor,
  subscriptionPlan,
}: ReglagesProps) {
  const [wsName, setWsName] = useState(initialWorkspaceName);
  const [accent, setAccent] = useState(initialAccentColor);
  const [fullName, setFullName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [notif, setNotif] = useState<Record<NotifKey, boolean>>({
    newDeliverable: true,
    comments: true,
    invoicePaid: true,
    weeklyDigest: false,
    productUpdates: false,
  });
  const [dangerOpen, setDangerOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [saved, setSaved] = useState(false);

  const [state, formAction] = useActionState(saveSettings, {
    error: null,
    success: false,
  });
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSave() {
    if (!formRef.current) return;
    const fd = new FormData();
    fd.set("workspaceName", wsName);
    fd.set("accentColor", accent);
    fd.set("fullName", fullName);
    fd.set("email", email);
    startTransition(async () => {
      const result = await saveSettings({ error: null, success: false }, fd);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
      }
    });
  }

  function handleCancel() {
    setWsName(initialWorkspaceName);
    setAccent(initialAccentColor);
    setFullName(userName);
    setEmail(userEmail);
  }

  const plan = PLAN_DATA[subscriptionPlan ?? ""] ?? FREE_PLAN;
  const wsInitial = (wsName.trim().charAt(0) || "L").toUpperCase();
  const canDelete =
    confirmText.trim() !== "" && confirmText.trim() === wsName.trim();

  return (
    <main
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Sticky top header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 28px",
          borderBottom: "1px solid var(--border-default)",
          background: "var(--surface-page)",
          position: "sticky",
          top: 0,
          zIndex: 20,
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
            Réglages
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--text-secondary)",
              margin: "3px 0 0",
            }}
          >
            Gérez votre workspace, votre profil et votre abonnement.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 13,
              color: "var(--color-success)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              opacity: saved ? 1 : 0,
              transition: "opacity 180ms",
            }}
          >
            <Check size={15} />
            Enregistré
          </span>
          {state.error && (
            <span style={{ fontSize: 13, color: "var(--color-danger)" }}>
              {state.error}
            </span>
          )}
          <button
            type="button"
            onClick={handleCancel}
            style={{
              height: 40,
              padding: "0 16px",
              border: "1px solid var(--border-default)",
              borderRadius: 8,
              background: "var(--surface-card)",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--text-primary)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            style={{
              height: 40,
              padding: "0 16px",
              border: "none",
              borderRadius: 8,
              background: "var(--indigo-500)",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.7 : 1,
              fontFamily: "var(--font-sans)",
            }}
          >
            {isPending ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            gap: 40,
            alignItems: "flex-start",
            padding: "32px 28px 80px",
            maxWidth: 1120,
            width: "100%",
          }}
        >
          {/* Secondary nav */}
          <nav
            style={{
              width: 184,
              flexShrink: 0,
              position: "sticky",
              top: 32,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {[
              { href: "#workspace", label: "Workspace", active: true },
              { href: "#profil", label: "Profil", active: false },
              { href: "#abonnement", label: "Abonnement", active: false },
              { href: "#notifications", label: "Notifications", active: false },
            ].map(({ href, label, active }) => (
              <a
                key={href}
                href={href}
                style={{
                  textDecoration: "none",
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                  color: active
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                  padding: "7px 10px",
                  borderRadius: 6,
                  background: active ? "var(--surface-card)" : "transparent",
                  border: active
                    ? "1px solid var(--border-default)"
                    : "1px solid transparent",
                }}
              >
                {label}
              </a>
            ))}
            <a
              href="#danger"
              style={{
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: 500,
                color: "var(--color-danger)",
                padding: "7px 10px",
                borderRadius: 6,
              }}
            >
              Zone de danger
            </a>
          </nav>

          {/* Sections */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              maxWidth: 680,
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {/* WORKSPACE */}
            <section
              id="workspace"
              style={{
                scrollMarginTop: 104,
                background: "var(--surface-card)",
                border: "1px solid var(--border-default)",
                borderRadius: 12,
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  padding: "22px 26px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    margin: 0,
                  }}
                >
                  Workspace
                </h2>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "var(--text-secondary)",
                    margin: "4px 0 0",
                  }}
                >
                  Informations publiques de votre espace de travail.
                </p>
              </div>
              <div
                style={{
                  padding: "24px 26px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 22,
                }}
              >
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      flexShrink: 0,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 24,
                      letterSpacing: "-0.02em",
                      background: accent,
                    }}
                  >
                    {wsInitial}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" style={btnSecondarySmStyle}>
                        Importer un logo
                      </button>
                      <button type="button" style={btnGhostSmStyle}>
                        Supprimer
                      </button>
                    </div>
                    <span
                      style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}
                    >
                      PNG ou SVG, 1 Mo maximum.
                    </span>
                  </div>
                </div>

                {/* Workspace name */}
                <div style={{ maxWidth: 380 }}>
                  <label style={labelStyle}>Nom du workspace</label>
                  <input
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Slug */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label style={labelStyle}>Adresse du workspace</label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: 40,
                      maxWidth: 380,
                      border: "1px solid var(--border-default)",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "var(--surface-sunken)",
                    }}
                  >
                    <span
                      style={{
                        padding: "0 4px 0 12px",
                        fontSize: 14,
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      livra.app/
                    </span>
                    <span
                      style={{
                        flex: 1,
                        paddingRight: 12,
                        fontSize: 14,
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {workspaceSlug}
                    </span>
                  </div>
                  <span
                    style={{ fontSize: 13, color: "var(--text-secondary)" }}
                  >
                    Visible par vos clients.
                  </span>
                </div>

                {/* Accent color */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <label style={labelStyle}>Couleur d'accent</label>
                  <div
                    style={{ display: "flex", gap: 14, alignItems: "center" }}
                  >
                    {ACCENTS.map((a) => (
                      <button
                        key={a.hex}
                        type="button"
                        title={a.name}
                        onClick={() => setAccent(a.hex)}
                        style={{
                          width: 30,
                          height: 30,
                          flexShrink: 0,
                          borderRadius: 9999,
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          background: a.hex,
                          boxShadow:
                            accent === a.hex
                              ? `0 0 0 2px var(--surface-card), 0 0 0 4px ${a.hex}`
                              : "0 0 0 1px rgba(15,23,42,0.10)",
                          transition: "box-shadow 120ms",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{ fontSize: 13, color: "var(--text-secondary)" }}
                  >
                    Utilisée pour les liens, les boutons et le portail client.
                  </span>
                </div>
              </div>
            </section>

            {/* PROFIL */}
            <section
              id="profil"
              style={{
                scrollMarginTop: 104,
                background: "var(--surface-card)",
                border: "1px solid var(--border-default)",
                borderRadius: 12,
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  padding: "22px 26px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    margin: 0,
                  }}
                >
                  Profil
                </h2>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "var(--text-secondary)",
                    margin: "4px 0 0",
                  }}
                >
                  Vos informations personnelles et de connexion.
                </p>
              </div>
              <div
                style={{
                  padding: "24px 26px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 22,
                }}
              >
                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 9999,
                      background: "var(--indigo-500)",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 17,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {(fullName.trim().charAt(0) || "?").toUpperCase()}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" style={btnSecondarySmStyle}>
                      Changer la photo
                    </button>
                    <button type="button" style={btnGhostSmStyle}>
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Name + email grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    maxWidth: 520,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Nom complet</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Password */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: 18,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      Mot de passe
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        marginTop: 2,
                      }}
                    >
                      Modifié il y a 3 mois.
                    </div>
                  </div>
                  <button type="button" style={btnSecondarySmStyle}>
                    Changer le mot de passe
                  </button>
                </div>
              </div>
            </section>

            {/* ABONNEMENT */}
            <section
              id="abonnement"
              style={{
                scrollMarginTop: 104,
                background: "var(--surface-card)",
                border: "1px solid var(--border-default)",
                borderRadius: 12,
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  padding: "22px 26px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    margin: 0,
                  }}
                >
                  Abonnement
                </h2>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "var(--text-secondary)",
                    margin: "4px 0 0",
                  }}
                >
                  Votre plan, votre facturation et vos paiements.
                </p>
              </div>
              <div
                style={{
                  padding: "24px 26px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                {/* Plan card */}
                <div
                  style={{
                    border: "1px solid var(--border-default)",
                    borderRadius: 12,
                    padding: 20,
                    background: "var(--surface-sunken)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          Plan {plan.name}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            height: 22,
                            padding: "0 8px",
                            borderRadius: 9999,
                            background: plan.badgeBg,
                            color: plan.badgeFg,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 9999,
                              background: plan.badgeDot,
                              flexShrink: 0,
                            }}
                          />
                          {plan.status}
                        </span>
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {plan.price}
                        </span>{" "}
                        {plan.cycle}
                      </div>
                      {plan.renew && (
                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            fontSize: 13,
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Calendar
                            size={15}
                            style={{ color: "var(--slate-400)" }}
                          />
                          <span>Prochain renouvellement le {plan.renew}.</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px 22px",
                      marginTop: 18,
                    }}
                  >
                    {plan.feats.map((feat) => (
                      <span
                        key={feat}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          fontSize: 13.5,
                          color: "var(--text-primary)",
                        }}
                      >
                        <Check
                          size={15}
                          style={{ color: "var(--indigo-500)", flexShrink: 0 }}
                        />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Billing actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 12.5,
                      color: "var(--text-tertiary)",
                    }}
                  >
                    <Lock size={14} />
                    Paiement et facturation sécurisés via Stripe.
                  </span>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Link
                      href="/factures"
                      style={{
                        ...btnSecondaryStyle,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      Voir les factures
                    </Link>
                    <button type="button" style={btnPrimaryStyle}>
                      {plan.primaryCta}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* NOTIFICATIONS */}
            <section
              id="notifications"
              style={{
                scrollMarginTop: 104,
                background: "var(--surface-card)",
                border: "1px solid var(--border-default)",
                borderRadius: 12,
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  padding: "22px 26px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    margin: 0,
                  }}
                >
                  Notifications
                </h2>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "var(--text-secondary)",
                    margin: "4px 0 0",
                  }}
                >
                  Choisissez les emails que Livra vous envoie.
                </p>
              </div>
              <div
                style={{
                  padding: "8px 26px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {NOTIF_DEFS.map((row, i) => (
                  <div
                    key={row.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "16px 0",
                      borderBottom:
                        i < NOTIF_DEFS.length - 1
                          ? "1px solid var(--border-subtle)"
                          : "none",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {row.title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          marginTop: 2,
                        }}
                      >
                        {row.desc}
                      </div>
                    </div>
                    <Switch
                      checked={notif[row.key]}
                      onChange={() =>
                        setNotif((prev) => ({
                          ...prev,
                          [row.key]: !prev[row.key],
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* ZONE DE DANGER */}
            <section
              id="danger"
              style={{
                scrollMarginTop: 104,
                background: "var(--surface-card)",
                border: "1px solid var(--color-danger)",
                borderRadius: 12,
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  padding: "22px 26px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    margin: 0,
                    color: "var(--color-danger)",
                  }}
                >
                  Zone de danger
                </h2>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "var(--text-secondary)",
                    margin: "4px 0 0",
                  }}
                >
                  Ces actions sont définitives et irréversibles.
                </p>
              </div>
              <div style={{ padding: "22px 26px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      Supprimer le compte
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        marginTop: 2,
                        maxWidth: 420,
                      }}
                    >
                      Supprime définitivement votre workspace, vos livrables et
                      vos factures. Cette action ne peut pas être annulée.
                    </div>
                  </div>
                  {!dangerOpen && (
                    <button
                      type="button"
                      onClick={() => setDangerOpen(true)}
                      style={{
                        height: 40,
                        padding: "0 16px",
                        border: "1px solid var(--color-danger)",
                        borderRadius: 8,
                        background: "transparent",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-danger)",
                        cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        flexShrink: 0,
                      }}
                    >
                      Supprimer le compte
                    </button>
                  )}
                </div>

                {dangerOpen && (
                  <div
                    style={{
                      marginTop: 18,
                      padding: 18,
                      border: "1px solid var(--color-danger)",
                      borderRadius: 10,
                      background: "var(--color-danger-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div style={{ fontSize: 13.5, color: "var(--red-600)" }}>
                      Pour confirmer, saisissez le nom du workspace{" "}
                      <strong>{wsName}</strong> ci-dessous.
                    </div>
                    <input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={wsName}
                      style={{
                        height: 40,
                        padding: "0 12px",
                        border: "1px solid var(--color-danger)",
                        borderRadius: 8,
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        background: "var(--surface-card)",
                        color: "var(--text-primary)",
                        outline: "none",
                        maxWidth: 320,
                      }}
                    />
                    <div style={{ display: "flex", gap: 10 }}>
                      <form action={deleteAccount}>
                        <button
                          type="submit"
                          disabled={!canDelete}
                          style={{
                            height: 40,
                            padding: "0 16px",
                            border: "none",
                            borderRadius: 8,
                            background: canDelete
                              ? "var(--color-danger)"
                              : "var(--slate-200)",
                            fontSize: 14,
                            fontWeight: 600,
                            color: canDelete ? "#fff" : "var(--slate-400)",
                            cursor: canDelete ? "pointer" : "default",
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Supprimer définitivement
                        </button>
                      </form>
                      <button
                        type="button"
                        onClick={() => {
                          setDangerOpen(false);
                          setConfirmText("");
                        }}
                        style={btnGhostStyle}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      {/* hidden form ref for useActionState */}
      <form ref={formRef} action={formAction} style={{ display: "none" }} />
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  color: "var(--text-primary)",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: 40,
  padding: "0 12px",
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  color: "var(--text-primary)",
  background: "var(--surface-card)",
  outline: "none",
  boxSizing: "border-box",
};

const btnSecondarySmStyle: React.CSSProperties = {
  height: 32,
  padding: "0 12px",
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  background: "var(--surface-card)",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text-primary)",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

const btnGhostSmStyle: React.CSSProperties = {
  height: 32,
  padding: "0 12px",
  border: "none",
  borderRadius: 8,
  background: "transparent",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text-secondary)",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

const btnSecondaryStyle: React.CSSProperties = {
  height: 40,
  padding: "0 16px",
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  background: "var(--surface-card)",
  fontSize: 14,
  fontWeight: 500,
  color: "var(--text-primary)",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

const btnGhostStyle: React.CSSProperties = {
  height: 40,
  padding: "0 16px",
  border: "none",
  borderRadius: 8,
  background: "transparent",
  fontSize: 14,
  fontWeight: 500,
  color: "var(--text-secondary)",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

const btnPrimaryStyle: React.CSSProperties = {
  height: 40,
  padding: "0 16px",
  border: "none",
  borderRadius: 8,
  background: "var(--indigo-500)",
  fontSize: 14,
  fontWeight: 600,
  color: "#fff",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};
