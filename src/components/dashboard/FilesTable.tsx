"use client";

import { useState } from "react";
import {
  Search,
  Download,
  FolderSearch,
  Upload,
  FileText,
  FileArchive,
  Image as ImageIcon,
  Video,
  PenTool,
  File,
  ChevronDown,
} from "lucide-react";

export type FileRow = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  createdAtISO: string;
  projectName: string;
  clientName: string;
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

function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return (
      (Math.round((bytes / 1024 / 1024) * 10) / 10)
        .toString()
        .replace(".", ",") + " Mo"
    );
  }
  return Math.round(bytes / 1024) + " Ko";
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

function getFileExt(name: string): string {
  return name.split(".").pop()?.toUpperCase() ?? "";
}

function FileTypeIcon({ mimeType, name }: { mimeType: string; name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const props = {
    size: 17,
    strokeWidth: 1.75,
    color: "var(--indigo-600)",
  } as const;

  if (mimeType === "application/pdf" || ext === "pdf")
    return <FileText {...props} />;
  if (
    mimeType.includes("zip") ||
    mimeType.includes("archive") ||
    ["zip", "rar", "tar", "gz", "7z"].includes(ext)
  )
    return <FileArchive {...props} />;
  if (
    mimeType.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)
  )
    return <ImageIcon {...props} />;
  if (mimeType.startsWith("video/")) return <Video {...props} />;
  if (ext === "ai" || ext === "eps") return <PenTool {...props} />;
  if (ext === "fig") return <File {...props} />;
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    ["doc", "docx", "txt", "rtf"].includes(ext)
  )
    return <FileText {...props} />;
  return <File {...props} />;
}

const GRID_COLS = "minmax(0,1fr) 128px 106px 62px 78px 152px 40px";

interface Props {
  rows: FileRow[];
  userName: string;
}

export default function FilesTable({ rows, userName }: Props) {
  const [query, setQuery] = useState("");
  const [project, setProject] = useState("Tous les projets");

  const projectOptions = [
    "Tous les projets",
    ...Array.from(new Set(rows.map((r) => r.projectName))).sort(),
  ];

  const q = query.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    const okProject =
      project === "Tous les projets" || r.projectName === project;
    const okQ =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.clientName.toLowerCase().includes(q) ||
      r.projectName.toLowerCase().includes(q);
    return okProject && okQ;
  });

  const totalSize = filtered.reduce((s, r) => s + r.sizeBytes, 0);
  const countLabel = filtered.length > 1 ? "fichiers" : "fichier";

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
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
            Fichiers
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--text-secondary)",
              margin: "3px 0 0",
            }}
          >
            Tous les fichiers partagés sur l'ensemble de vos projets.
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
              placeholder="Rechercher un fichier…"
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
          <button
            disabled
            title="L'import se fait depuis la page d'un projet"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 38,
              padding: "0 16px",
              border: "none",
              borderRadius: 8,
              background: "var(--indigo-500)",
              color: "#fff",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "not-allowed",
              opacity: 0.5,
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <Upload size={16} strokeWidth={2} />
            Importer un fichier
          </button>
        </div>
      </div>

      {/* Sub-header: count + project filter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "14px 28px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--surface-page)",
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {filtered.length}
          </span>{" "}
          {countLabel} ·{" "}
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {fmtSize(totalSize)}
          </span>{" "}
          au total
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-tertiary)",
            }}
          >
            Projet
          </span>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              style={{
                appearance: "none",
                height: 36,
                padding: "0 34px 0 12px",
                borderRadius: 8,
                border: "1px solid var(--border-default)",
                background: "var(--surface-card)",
                fontFamily: "var(--font-sans)",
                fontSize: 13.5,
                color: "var(--text-primary)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {projectOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              strokeWidth={2}
              style={{
                position: "absolute",
                right: 11,
                pointerEvents: "none",
                color: "var(--slate-400)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
        <div
          style={{
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
              gap: 10,
              padding: "11px 18px",
              borderBottom: "1px solid var(--border-default)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            <span>Fichier</span>
            <span>Projet</span>
            <span>Client</span>
            <span>Taille</span>
            <span>Ajouté le</span>
            <span>Importé par</span>
            <span />
          </div>

          {/* Rows */}
          {filtered.map((row) => {
            const ext = getFileExt(row.name);
            const isFreelance = row.uploadedBy === "freelance";
            const uploaderName = isFreelance ? userName : row.clientName;
            const av = getAvatar(uploaderName);
            const avatarBg = isFreelance ? "var(--indigo-50)" : av.color + "20";
            const avatarFg = isFreelance ? "var(--indigo-600)" : av.color;
            const roleFg = isFreelance
              ? "var(--indigo-500)"
              : "var(--text-tertiary)";

            return (
              <div
                key={row.id}
                className="hover:bg-slate-50"
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID_COLS,
                  gap: 10,
                  alignItems: "center",
                  padding: "13px 18px",
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background 120ms",
                }}
              >
                {/* File */}
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
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "var(--indigo-50)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileTypeIcon mimeType={row.mimeType} name={row.name} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: "var(--text-primary)",
                      }}
                    >
                      {row.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {ext}
                    </div>
                  </div>
                </div>

                {/* Project */}
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

                {/* Client */}
                <span
                  style={{
                    fontSize: 13.5,
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {row.clientName}
                </span>

                {/* Size */}
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {fmtSize(row.sizeBytes)}
                </span>

                {/* Date */}
                <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                  {fmtDate(row.createdAtISO)}
                </span>

                {/* Uploader */}
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
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.01em",
                      background: avatarBg,
                      color: avatarFg,
                    }}
                  >
                    {av.initials}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: "var(--text-primary)",
                      }}
                    >
                      {uploaderName}
                    </div>
                    <div
                      style={{ fontSize: 11, color: roleFg, fontWeight: 600 }}
                    >
                      {isFreelance ? "Freelance" : "Client"}
                    </div>
                  </div>
                </div>

                {/* Download */}
                <a
                  href={`/api/uploads/download?fileId=${row.id}`}
                  title="Télécharger"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: "1px solid var(--border-default)",
                    background: "var(--surface-card)",
                    color: "var(--slate-500)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition: "all 120ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--indigo-50)";
                    e.currentTarget.style.color = "var(--indigo-600)";
                    e.currentTarget.style.borderColor = "var(--indigo-200)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--surface-card)";
                    e.currentTarget.style.color = "var(--slate-500)";
                    e.currentTarget.style.borderColor = "var(--border-default)";
                  }}
                >
                  <Download size={16} strokeWidth={2} />
                </a>
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
              <FolderSearch
                size={30}
                strokeWidth={1.5}
                style={{ color: "var(--slate-300)" }}
              />
              <span style={{ fontSize: 14.5, color: "var(--text-tertiary)" }}>
                {q
                  ? "Aucun fichier ne correspond à votre recherche."
                  : "Aucun fichier pour le moment."}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
