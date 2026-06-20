import { Inter } from "next/font/google";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  LayoutDashboard,
  Folder,
  ReceiptEuro,
  MessageSquare,
  Settings,
  FileText,
  Mail,
  Send,
  MessageCircle,
  CreditCard,
  Table2,
  X,
  Check,
  FolderOpen,
  File,
  Activity,
  ShieldCheck,
} from "lucide-react";

function IconTwitterX({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLinkedin({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function IconGithub({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}
import NavBar from "@/components/landing/NavBar";

const inter = Inter({ subsets: ["latin"] });

function Btn({
  variant = "primary",
  size = "md",
  fullWidth = false,
  dark = false,
  href,
  children,
}: {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  dark?: boolean;
  href?: string;
  children: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    borderRadius: 8,
    border: "1px solid transparent",
    cursor: "pointer",
    width: fullWidth ? "100%" : "auto",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    textDecoration: "none",
    gap: 8,
    ...(size === "sm" && { fontSize: 14, padding: "0 14px", height: 36 }),
    ...(size === "md" && { fontSize: 15, padding: "0 16px", height: 40 }),
    ...(size === "lg" && { fontSize: 16, padding: "0 20px", height: 48 }),
    ...(variant === "primary" && {
      background: "var(--indigo-500)",
      color: "#fff",
      borderColor: "var(--indigo-500)",
    }),
    ...(variant === "secondary" &&
      !dark && {
        background: "#fff",
        color: "var(--text-primary)",
        borderColor: "var(--border-default)",
      }),
    ...(variant === "secondary" &&
      dark && {
        background: "transparent",
        color: "var(--slate-200)",
        borderColor: "#3a3a42",
      }),
    ...(variant === "ghost" && {
      background: "transparent",
      color: "var(--text-secondary)",
      borderColor: "transparent",
    }),
  };

  if (href) {
    return (
      <Link href={href} style={base}>
        {children}
      </Link>
    );
  }
  return <button style={base}>{children}</button>;
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const dim = size === "sm" ? 32 : 40;
  return (
    <div
      style={{
        width: dim,
        height: dim,
        borderRadius: "50%",
        background: "var(--indigo-100)",
        color: "var(--indigo-700)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size === "sm" ? 12 : 14,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "Validé" | "En revue" | "Nouveau";
}) {
  const colors = {
    Validé: {
      color: "var(--emerald-700)",
      bg: "var(--emerald-50)",
      dot: "var(--emerald-500)",
    },
    "En revue": {
      color: "var(--amber-600)",
      bg: "var(--amber-50)",
      dot: "var(--amber-500)",
    },
    Nouveau: {
      color: "var(--indigo-600)",
      bg: "var(--indigo-50)",
      dot: "var(--indigo-500)",
    },
  };
  const c = colors[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: c.color,
        background: c.bg,
        padding: "3px 9px",
        borderRadius: 9999,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.dot,
        }}
      />
      {status}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div
      className={inter.className}
      style={{
        background: "var(--surface-page)",
        color: "var(--text-primary)",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <NavBar />

      {/* ===== HERO ===== */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: -200,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 600,
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(99,102,241,0.16) 0%, rgba(99,102,241,0) 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "88px 24px 64px",
            textAlign: "center",
          }}
        >
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-secondary)",
              background: "var(--surface-card)",
              border: "1px solid var(--border-default)",
              borderRadius: 9999,
              padding: "5px 14px 5px 6px",
              marginBottom: 28,
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <span
              style={{
                background: "var(--indigo-50)",
                color: "var(--indigo-700)",
                fontWeight: 600,
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 9999,
              }}
            >
              Nouveau
            </span>
            Facturation électronique 2026 conforme
            <ArrowRight size={14} />
          </a>

          <h1
            style={{
              fontSize: 60,
              lineHeight: 1.04,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              margin: "0 auto 20px",
              maxWidth: 840,
            }}
          >
            Le portail client que vos clients vont enfin adorer
          </h1>
          <p
            style={{
              fontSize: 20,
              lineHeight: 1.5,
              color: "var(--text-secondary)",
              margin: "0 auto 32px",
              maxWidth: 640,
            }}
          >
            Fini les fichiers perdus entre email, WeTransfer, WhatsApp et
            PayPal. Partagez vos livrables, suivez vos missions et facturez — en
            conformité avec le droit français — depuis un seul espace.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Btn variant="primary" size="lg" href="/signup">
              Démarrer gratuitement <ArrowRight size={18} />
            </Btn>
            <Btn variant="secondary" size="lg">
              <Play size={16} /> Voir la démo
            </Btn>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0 }}>
            Sans carte bancaire · 14 jours d&apos;essai · Résiliable à tout
            moment
          </p>

          {/* Product shot */}
          <div
            style={{
              marginTop: 56,
              borderRadius: 16,
              border: "1px solid var(--border-default)",
              background: "var(--surface-card)",
              boxShadow: "var(--shadow-lg)",
              overflow: "hidden",
              textAlign: "left",
              maxWidth: 980,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* Browser chrome */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--surface-sunken)",
              }}
            >
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#febc2e",
                }}
              />
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#28c840",
                }}
              />
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#ff5f57",
                }}
              />
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--text-tertiary)",
                  fontFamily:
                    "ui-monospace, SF Mono, Menlo, Consolas, monospace",
                }}
              >
                livra.app/atlas-studio
              </div>
            </div>

            {/* App layout */}
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
              {/* Sidebar */}
              <div
                style={{
                  borderRight: "1px solid var(--border-subtle)",
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px 14px",
                  }}
                >
                  <img src="/logo-mark.svg" width={22} height={22} alt="" />
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Livra
                  </span>
                </div>
                {(
                  [
                    [LayoutDashboard, "Tableau de bord", true],
                    [Folder, "Livrables", false],
                    [ReceiptEuro, "Factures", false],
                    [MessageSquare, "Messages", false],
                    [Settings, "Paramètres", false],
                  ] as const
                ).map(([Icon, label, active]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 500,
                      color: active
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                      background: active ? "var(--surface-sunken)" : undefined,
                    }}
                  >
                    <Icon
                      size={16}
                      color={active ? "var(--indigo-500)" : "var(--slate-400)"}
                    />
                    {label}
                  </div>
                ))}
              </div>

              {/* Main panel */}
              <div style={{ background: "var(--surface-page)" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 18px 14px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Refonte du site
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        marginTop: 2,
                      }}
                    >
                      Studio Atlas · Mission #204
                    </div>
                  </div>
                  <Avatar name="Camille Roy" size="sm" />
                </div>

                {/* Stats row */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "0 18px 16px",
                  }}
                >
                  {(
                    [
                      ["Livrables", "8", "var(--indigo-500)"],
                      ["En attente", "2", "var(--amber-500)"],
                      ["Facturé", "4 200 €", "var(--emerald-500)"],
                    ] as const
                  ).map(([label, value, color]) => (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        border: "1px solid var(--border-default)",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          marginBottom: 6,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Deliverables table */}
                <div
                  style={{
                    margin: "0 18px 18px",
                    border: "1px solid var(--border-default)",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Livrables récents
                  </div>
                  {(
                    [
                      ["Maquettes Figma — V2.fig", "Validé", "12 juin"],
                      ["Charte graphique.pdf", "En revue", "10 juin"],
                      ["Bannières réseaux.zip", "Validé", "4 juin"],
                    ] as const
                  ).map(([name, status, date]) => (
                    <div
                      key={name}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto auto",
                        alignItems: "center",
                        gap: 16,
                        padding: "14px 18px",
                        borderTop: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 7,
                            background: "var(--indigo-50)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--indigo-600)",
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={16} />
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>
                          {name}
                        </span>
                      </div>
                      <StatusBadge status={status} />
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--text-tertiary)",
                          width: 90,
                          textAlign: "right",
                        }}
                      >
                        {date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section
        style={{
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--surface-sunken)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              margin: "0 0 24px",
            }}
          >
            + de 3 200 freelances facturent déjà avec Livra
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {[
              "Atelier Nord",
              "Studio Atlas",
              "Frély & Co",
              "Maison Verre",
              "Praxis",
              "Onde",
            ].map((name) => (
              <span
                key={name}
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: "var(--slate-400)",
                  letterSpacing: "-0.02em",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BEFORE / AFTER ===== */}
      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "112px 24px" }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 660,
            margin: "0 auto 56px",
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--indigo-500)",
              margin: "0 0 12px",
            }}
          >
            Un seul outil à la place de cinq
          </p>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              margin: "0 0 16px",
            }}
          >
            Avant, c&apos;était cinq apps. Maintenant, c&apos;est Livra.
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.5,
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            Vos clients passaient d&apos;un email à un lien WeTransfer,
            d&apos;un message WhatsApp à un paiement PayPal. Livra réunit tout
            dans un espace clair qu&apos;ils comprennent du premier coup.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 64px 1fr",
            alignItems: "center",
          }}
        >
          {/* Avant */}
          <div
            style={{
              border: "1px solid var(--border-default)",
              borderRadius: 16,
              background: "var(--surface-sunken)",
              padding: 28,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginBottom: 20,
              }}
            >
              Avant Livra
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(
                [
                  [Mail, "Email", "Devis et échanges éparpillés"],
                  [
                    Send,
                    "WeTransfer",
                    "Livrables qui expirent au bout de 7 jours",
                  ],
                  [
                    MessageCircle,
                    "WhatsApp",
                    "Relances et validations perdues",
                  ],
                  [CreditCard, "PayPal", "Paiements sans facture conforme"],
                  [Table2, "Tableur", "Suivi de mission tenu à la main"],
                ] as const
              ).map(([Icon, title, subtitle]) => (
                <div
                  key={title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-default)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: "var(--red-50)",
                      color: "var(--red-500)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={17} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{ fontSize: 13, color: "var(--text-secondary)" }}
                    >
                      {subtitle}
                    </div>
                  </div>
                  <X size={16} color="var(--text-tertiary)" />
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--indigo-500)",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(99,102,241,0.35)",
              }}
            >
              <ArrowRight size={20} />
            </span>
          </div>

          {/* Avec Livra */}
          <div
            style={{
              border: "1px solid var(--indigo-200)",
              borderRadius: 16,
              background: "var(--surface-card)",
              padding: 28,
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <img src="/logo-mark.svg" width={18} height={18} alt="" />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--indigo-600)",
                }}
              >
                Avec Livra
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(
                [
                  [
                    "Devis & factures conformes",
                    "TVA, mentions légales et numérotation automatiques.",
                  ],
                  [
                    "Livrables versionnés",
                    "Chaque version horodatée, jamais expirée.",
                  ],
                  [
                    "Messagerie par mission",
                    "Les échanges restent rattachés au bon projet.",
                  ],
                  [
                    "Suivi en temps réel",
                    "Le client sait toujours où en est la mission.",
                  ],
                  [
                    "Paiement rattaché à la facture",
                    "Encaissez et rapprochez sans ressaisie.",
                  ],
                ] as const
              ).map(([title, subtitle]) => (
                <div
                  key={title}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <Check
                    size={18}
                    strokeWidth={2.5}
                    color="var(--emerald-500)"
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        fontSize: 13.5,
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section
        id="fonctionnalites"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "112px 24px" }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 640,
            margin: "0 auto 56px",
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--indigo-500)",
              margin: "0 0 12px",
            }}
          >
            Tout au même endroit
          </p>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              margin: "0 0 16px",
            }}
          >
            De la mission au paiement, sans friction
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.5,
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            Quatre briques qui se parlent : partage de livrables, suivi de
            mission, messagerie et facturation conforme. Un espace pro par
            client, prêt en deux minutes.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {/* Wide feature card */}
          <div
            style={{
              border: "1px solid var(--border-default)",
              borderRadius: 16,
              background: "var(--surface-card)",
              padding: 28,
              boxShadow: "var(--shadow-xs)",
              display: "flex",
              flexDirection: "row",
              gap: 28,
              alignItems: "center",
              gridColumn: "span 2",
            }}
          >
            <div style={{ flex: 1 }}>
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "var(--indigo-50)",
                  color: "var(--indigo-600)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <FolderOpen size={20} />
              </span>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "var(--text-primary)",
                  margin: "0 0 6px",
                }}
              >
                Partage de livrables versionné
              </h3>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                Glissez vos fichiers, le client commente et valide. Chaque
                version est horodatée — fini les « derniere_version_FINALE_v3 ».
              </p>
            </div>
            <div
              style={{
                flex: 1,
                alignSelf: "stretch",
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
                background: "var(--surface-sunken)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {(
                [
                  ["Maquettes V2.fig", "var(--emerald-500)"],
                  ["Charte.pdf", "var(--amber-500)"],
                  ["Export final.zip", "var(--indigo-500)"],
                ] as const
              ).map(([name, dotColor]) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    padding: "9px 12px",
                  }}
                >
                  <File size={15} color="var(--slate-400)" />
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
                    {name}
                  </span>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: dotColor,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Single feature cards */}
          {(
            [
              [
                ReceiptEuro,
                "var(--emerald-50)",
                "var(--emerald-600)",
                "Facturation conforme",
                "Devis et factures aux normes françaises, TVA, mentions légales et numérotation automatiques.",
              ],
              [
                Activity,
                "var(--amber-50)",
                "var(--amber-600)",
                "Suivi de mission",
                "Jalons, échéances et statut en temps réel. Le client sait toujours où en est le projet.",
              ],
              [
                MessageSquare,
                "var(--indigo-50)",
                "var(--indigo-600)",
                "Messagerie par mission",
                "Chaque échange reste rattaché au bon projet. Plus de fil WhatsApp à remonter.",
              ],
              [
                ShieldCheck,
                "var(--emerald-50)",
                "var(--emerald-600)",
                "Données hébergées en France",
                "RGPD natif, serveurs européens, export complet à tout moment. Vos données restent les vôtres.",
              ],
            ] as const
          ).map(([Icon, iconBg, iconColor, title, description]) => (
            <div
              key={title}
              style={{
                border: "1px solid var(--border-default)",
                borderRadius: 16,
                background: "var(--surface-card)",
                padding: 28,
                boxShadow: "var(--shadow-xs)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: iconBg,
                  color: iconColor,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon size={20} />
              </span>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "var(--text-primary)",
                  margin: "0 0 6px",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section
        id="tarifs"
        style={{ background: "var(--black)", padding: "112px 0" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              textAlign: "center",
              maxWidth: 600,
              margin: "0 auto 56px",
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--indigo-300)",
                margin: "0 0 12px",
              }}
            >
              Tarifs
            </p>
            <h2
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--slate-50)",
                margin: "0 0 16px",
              }}
            >
              Un prix simple, sans surprise
            </h2>
            <p style={{ fontSize: 18, color: "var(--slate-400)", margin: 0 }}>
              Facturation mensuelle. Annulez quand vous voulez.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              maxWidth: 760,
              margin: "0 auto",
            }}
          >
            {/* Solo */}
            <div
              style={{
                borderRadius: 16,
                border: "1px solid #2a2a30",
                background: "#18181b",
                padding: 32,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--slate-200)",
                }}
              >
                Solo
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--slate-400)",
                  margin: "6px 0 20px",
                }}
              >
                Pour démarrer en indépendant.
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: "var(--slate-50)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  19 €
                </span>
                <span style={{ fontSize: 15, color: "var(--slate-500)" }}>
                  / mois
                </span>
              </div>
              <div style={{ marginBottom: 24 }}>
                <Btn
                  variant="secondary"
                  size="md"
                  fullWidth
                  dark
                  href="/signup"
                >
                  Choisir Solo
                </Btn>
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {[
                  "Jusqu'à 5 clients actifs",
                  "Livrables & suivi de mission",
                  "Messagerie par mission",
                  "Portail client personnalisé",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 14.5,
                      lineHeight: 1.45,
                      color: "var(--text-on-dark)",
                    }}
                  >
                    <Check
                      size={18}
                      strokeWidth={2.5}
                      color="var(--indigo-300)"
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div
              style={{
                position: "relative",
                borderRadius: 16,
                border: "1px solid var(--indigo-500)",
                background: "linear-gradient(180deg, #1c1b34 0%, #18181b 60%)",
                padding: 32,
                boxShadow: "0 24px 60px rgba(99,102,241,0.25)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#fff",
                  background: "var(--indigo-500)",
                  padding: "3px 10px",
                  borderRadius: 9999,
                }}
              >
                Populaire
              </span>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--slate-100)",
                }}
              >
                Pro
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--slate-400)",
                  margin: "6px 0 20px",
                }}
              >
                Pour les freelances établis.
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.03em",
                  }}
                >
                  39 €
                </span>
                <span style={{ fontSize: 15, color: "var(--slate-400)" }}>
                  / mois
                </span>
              </div>
              <div style={{ marginBottom: 24 }}>
                <Btn variant="primary" size="md" fullWidth href="/signup">
                  Choisir Pro
                </Btn>
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {[
                  "Clients & missions illimités",
                  "Facturation conforme & relances automatiques",
                  "Domaine personnalisé",
                  "Signature électronique des devis",
                  "Support prioritaire",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 14.5,
                      lineHeight: 1.45,
                      color: "var(--text-on-dark)",
                    }}
                  >
                    <Check
                      size={18}
                      strokeWidth={2.5}
                      color="var(--indigo-300)"
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        id="ressources"
        style={{
          borderTop: "1px solid var(--border-default)",
          background: "var(--surface-page)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "56px 24px 40px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
              gap: 32,
            }}
          >
            <div>
              <img src="/logo-wordmark.svg" alt="Livra" height={26} />
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "var(--text-secondary)",
                  margin: "16px 0 0",
                  maxWidth: 240,
                }}
              >
                Le portail client professionnel pour freelances. Conçu en
                France.
              </p>
            </div>

            {(
              [
                [
                  "Produit",
                  ["Fonctionnalités", "Tarifs", "Sécurité", "Nouveautés"],
                ],
                [
                  "Ressources",
                  [
                    "Documentation",
                    "Guides freelance",
                    "Modèles de devis",
                    "Blog",
                  ],
                ],
                [
                  "Entreprise",
                  ["À propos", "Clients", "Contact", "Mentions légales"],
                ],
              ] as const
            ).map(([heading, links]) => (
              <div key={heading}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 14,
                  }}
                >
                  {heading}
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        style={{
                          fontSize: 14,
                          color: "var(--text-secondary)",
                          textDecoration: "none",
                        }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 48,
              paddingTop: 24,
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              © 2026 Livra SAS · RGPD · Hébergé en France 🇫🇷
            </span>
            <div style={{ display: "flex", gap: 14 }}>
              <a href="#" style={{ color: "var(--text-tertiary)" }}>
                <IconTwitterX size={18} />
              </a>
              <a href="#" style={{ color: "var(--text-tertiary)" }}>
                <IconLinkedin size={18} />
              </a>
              <a href="#" style={{ color: "var(--text-tertiary)" }}>
                <IconGithub size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
