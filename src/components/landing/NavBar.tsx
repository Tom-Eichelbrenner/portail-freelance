"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function NavBar() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;

    const onScroll = () => {
      const scrolled = window.scrollY > 8;
      nav.style.background = scrolled
        ? "rgba(255,255,255,0.85)"
        : "rgba(255,255,255,0)";
      nav.style.backdropFilter = scrolled
        ? "saturate(180%) blur(12px)"
        : "none";
      (nav.style as unknown as Record<string, string>)["webkitBackdropFilter"] =
        scrolled ? "saturate(180%) blur(12px)" : "none";
      nav.style.borderBottomColor = scrolled
        ? "var(--border-default)"
        : "transparent";
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={ref}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0)",
        borderBottom: "1px solid transparent",
        transition:
          "background 180ms cubic-bezier(0.16,1,0.3,1), border-color 180ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <Link href="/" aria-label="Livra">
            <img src="/logo-wordmark.svg" alt="Livra" height={28} />
          </Link>
          <nav style={{ display: "flex", gap: 4 }}>
            {(
              [
                ["#fonctionnalites", "Fonctionnalités"],
                ["#tarifs", "Tarifs"],
                ["#securite", "Sécurité"],
                ["#ressources", "Ressources"],
              ] as const
            ).map(([href, label]) => (
              <a
                key={href}
                href={href}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  padding: "8px 12px",
                  borderRadius: 8,
                }}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "0 14px",
              height: 36,
              borderRadius: 8,
              border: "1px solid transparent",
            }}
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
              padding: "0 14px",
              height: 36,
              borderRadius: 8,
              background: "var(--indigo-500)",
              border: "1px solid var(--indigo-500)",
            }}
          >
            Essayer gratuitement
          </Link>
        </div>
      </div>
    </header>
  );
}
