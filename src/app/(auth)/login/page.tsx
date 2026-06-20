"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";

const initialState = { error: null };

const URL_ERRORS: Record<string, string> = {
  no_workspace:
    "Compte incomplet — votre espace de travail n'existe pas. Recréez un compte ou contactez le support.",
};

function validateEmail(value: string): string | null {
  if (!value) return "L'email est requis";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email invalide";
  return null;
}

function validatePassword(value: string): string | null {
  if (!value) return "Le mot de passe est requis";
  if (value.length < 8) return "8 caractères minimum";
  return null;
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error")
    ? (URL_ERRORS[searchParams.get("error")!] ?? null)
    : null;
  const displayError = state.error ?? urlError;

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
        <div style={{ width: "100%", maxWidth: 380, margin: "0 auto" }}>
          <Image
            src="/logo-wordmark.svg"
            alt="Livra"
            width={120}
            height={30}
            style={{ marginBottom: 40 }}
          />

          <h1
            style={{
              fontSize: 27,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "0 0 8px",
            }}
          >
            Bon retour
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              margin: "0 0 32px",
              lineHeight: 1.5,
            }}
          >
            Connectez-vous à votre espace Livra.
          </p>

          <form
            action={formAction}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            {displayError && (
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
                {displayError}
              </div>
            )}

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
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="vous@studio.fr"
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px",
                  fontSize: 14,
                  border: `1px solid ${emailError ? "var(--red-500)" : "var(--border-default)"}`,
                  borderRadius: "var(--radius-md)",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "var(--text-primary)",
                  background: emailError ? "var(--red-50)" : "var(--white)",
                }}
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
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
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
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-link)",
                    textDecoration: "none",
                  }}
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px",
                  fontSize: 14,
                  border: `1px solid ${passwordError ? "var(--red-500)" : "var(--border-default)"}`,
                  borderRadius: "var(--radius-md)",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "var(--text-primary)",
                  background: passwordError ? "var(--red-50)" : "var(--white)",
                }}
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
              {passwordError && (
                <span style={{ fontSize: 12, color: "var(--red-600)" }}>
                  {passwordError}
                </span>
              )}
            </div>

            {/* Submit */}
            <div style={{ marginTop: 6 }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  width: "100%",
                  height: 48,
                  background: isPending
                    ? "var(--indigo-400)"
                    : "var(--indigo-500)",
                  color: "var(--white)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isPending)
                    e.currentTarget.style.background = "var(--indigo-600)";
                }}
                onMouseLeave={(e) => {
                  if (!isPending)
                    e.currentTarget.style.background = "var(--indigo-500)";
                }}
              >
                {isPending ? "Connexion…" : "Se connecter"}
              </button>
            </div>
          </form>

          <p
            style={{
              fontSize: 13.5,
              color: "var(--text-tertiary)",
              textAlign: "center",
              margin: "24px 0 0",
            }}
          >
            Pas encore de compte ?{" "}
            <Link
              href="/signup"
              style={{
                color: "var(--text-link)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Créer un compte
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
            }}
          >
            <div style={{ fontSize: 13, color: "var(--slate-400)" }}>
              Sans carte bancaire · 14 jours d&apos;essai · Résiliable à tout
              moment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
