"use client";

import { useActionState, useState } from "react";
import { signup } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";

const initialState = { error: null };

const reassurances = [
  {
    label: "Aucune carte bancaire requise",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: "Données hébergées en France",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "Conforme RGPD",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    label: "Résiliable à tout moment",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="10" y1="14" x2="14" y2="14" />
        <line x1="12" y1="12" x2="12" y2="16" />
      </svg>
    ),
  },
];

function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function validateName(v: string) {
  if (!v.trim()) return "Le nom complet est requis";
  return null;
}
function validateEmail(v: string) {
  if (!v) return "L'email est requis";
  if (!/\S+@\S+\.\S+/.test(v)) return "Email invalide";
  return null;
}
function validatePassword(v: string) {
  if (!v) return "Le mot de passe est requis";
  if (v.length < 8) return "8 caractères minimum";
  return null;
}

const input = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  height: 40,
  padding: "0 12px",
  fontSize: 14,
  border: `1px solid ${hasError ? "var(--red-500)" : "var(--border-default)"}`,
  borderRadius: "var(--radius-md)",
  outline: "none",
  boxSizing: "border-box",
  color: "var(--text-primary)",
  background: hasError ? "var(--red-50)" : "var(--white)",
});

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      style={{
        height: "100vh",
        minHeight: 600,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--white)",
        color: "var(--text-primary)",
      }}
    >
      {/* Form side */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 64px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
          <Image
            src="/logo-wordmark.svg"
            alt="Livra"
            width={120}
            height={30}
            style={{ marginBottom: 32 }}
          />

          {/* Trial badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.01em",
                padding: "3px 9px",
                borderRadius: "var(--radius-full)",
                background: "var(--color-primary-subtle)",
                color: "var(--color-primary)",
                border: "1px solid var(--indigo-200)",
              }}
            >
              Essai gratuit
            </span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              14 jours · sans carte bancaire
            </span>
          </div>

          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              margin: "0 0 8px",
            }}
          >
            Créez votre compte
          </h1>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              margin: "0 0 28px",
            }}
          >
            Rejoignez les freelances qui gèrent leurs clients avec sérénité.
          </p>

          <form
            action={formAction}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            {state.error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--red-600)",
                  background: "var(--red-50)",
                  border: "1px solid #fecaca",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
                  <path
                    d="M7 4v3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                </svg>
                {state.error}
              </div>
            )}

            {/* Full name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="fullName"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Nom complet
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="Camille Roy"
                style={input(!!nameError)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = nameError
                    ? "var(--red-500)"
                    : "var(--border-focus)";
                  e.currentTarget.style.boxShadow = nameError
                    ? "0 0 0 3px rgba(239,68,68,0.2)"
                    : "var(--shadow-focus)";
                }}
                onBlur={(e) => {
                  const err = validateName(e.currentTarget.value);
                  setNameError(err);
                  e.currentTarget.style.borderColor = err
                    ? "var(--red-500)"
                    : "var(--border-default)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = err
                    ? "var(--red-50)"
                    : "var(--white)";
                }}
              />
              {nameError && (
                <span style={{ fontSize: 12, color: "var(--red-600)" }}>
                  {nameError}
                </span>
              )}
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Email professionnel
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="vous@studio.fr"
                style={input(!!emailError)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = emailError
                    ? "var(--red-500)"
                    : "var(--border-focus)";
                  e.currentTarget.style.boxShadow = emailError
                    ? "0 0 0 3px rgba(239,68,68,0.2)"
                    : "var(--shadow-focus)";
                }}
                onBlur={(e) => {
                  const err = validateEmail(e.currentTarget.value);
                  setEmailError(err);
                  e.currentTarget.style.borderColor = err
                    ? "var(--red-500)"
                    : "var(--border-default)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = err
                    ? "var(--red-50)"
                    : "var(--white)";
                }}
              />
              {emailError && (
                <span style={{ fontSize: 12, color: "var(--red-600)" }}>
                  {emailError}
                </span>
              )}
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="8 caractères minimum"
                  minLength={8}
                  style={input(!!passwordError)}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = passwordError
                      ? "var(--red-500)"
                      : "var(--border-focus)";
                    e.currentTarget.style.boxShadow = passwordError
                      ? "0 0 0 3px rgba(239,68,68,0.2)"
                      : "var(--shadow-focus)";
                  }}
                  onBlur={(e) => {
                    const err = validatePassword(e.currentTarget.value);
                    setPasswordError(err);
                    e.currentTarget.style.borderColor = err
                      ? "var(--red-500)"
                      : "var(--border-default)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = err
                      ? "var(--red-50)"
                      : "var(--white)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: 28,
                    width: 28,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    background: "transparent",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    borderRadius: 6,
                    padding: 0,
                  }}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
              {passwordError ? (
                <span style={{ fontSize: 12, color: "var(--red-600)" }}>
                  {passwordError}
                </span>
              ) : (
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  Au moins 8 caractères, avec une majuscule et un chiffre.
                </span>
              )}
            </div>

            {/* CGU checkbox */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                cursor: "pointer",
                marginTop: 2,
              }}
            >
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                style={{
                  marginTop: 2,
                  accentColor: "var(--indigo-500)",
                  width: 15,
                  height: 15,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: "var(--text-secondary)",
                }}
              >
                {"J'accepte les "}
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    color: "var(--text-link)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  conditions générales
                </a>
                {" et la "}
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    color: "var(--text-link)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  politique de confidentialité
                </a>
                .
              </span>
            </label>

            {/* Submit */}
            <div style={{ marginTop: 4 }}>
              <button
                type="submit"
                disabled={isPending || !agree}
                style={{
                  width: "100%",
                  height: 48,
                  background:
                    isPending || !agree
                      ? "var(--indigo-400)"
                      : "var(--indigo-500)",
                  color: "var(--white)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: isPending || !agree ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!isPending && agree)
                    e.currentTarget.style.background = "var(--indigo-600)";
                }}
                onMouseLeave={(e) => {
                  if (!isPending && agree)
                    e.currentTarget.style.background = "var(--indigo-500)";
                }}
              >
                {isPending ? "Création…" : "Démarrer gratuitement"}
                {!isPending && <ArrowRightIcon />}
              </button>
            </div>
          </form>

          {/* Trust signals */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 18,
              fontSize: 12.5,
              color: "var(--text-tertiary)",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              Conforme RGPD
            </span>
            <span
              style={{
                width: 1,
                height: 12,
                background: "var(--border-default)",
              }}
            />
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Données en France
            </span>
            <span
              style={{
                width: 1,
                height: 12,
                background: "var(--border-default)",
              }}
            />
            <span>Résiliable à tout moment</span>
          </div>

          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              textAlign: "center",
              margin: "28px 0 0",
            }}
          >
            Déjà un compte ?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--text-link)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* Brand side */}
      <div
        style={{
          background: "var(--black)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 56,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 50% at 72% 28%, rgba(99,102,241,0.30) 0%, rgba(99,102,241,0) 70%)",
          }}
        />
        <div style={{ position: "relative", maxWidth: 400 }}>
          <Image
            src="/logo-mark.svg"
            alt=""
            width={34}
            height={34}
            style={{ marginBottom: 32, opacity: 0.95 }}
          />
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "var(--slate-50)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Le portail client que vos clients vont enfin adorer.
          </div>
          <p
            style={{
              fontSize: 15,
              color: "var(--slate-400)",
              lineHeight: 1.6,
              margin: "18px 0 0",
            }}
          >
            Partagez vos livrables, suivez vos missions et facturez en
            conformité avec le droit français.
          </p>
          <div
            style={{
              marginTop: 48,
              paddingTop: 28,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {reassurances.map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  fontSize: 14,
                  color: "var(--slate-300)",
                }}
              >
                <span
                  style={{ color: "var(--indigo-300)", display: "inline-flex" }}
                >
                  {r.icon}
                </span>
                <span>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
