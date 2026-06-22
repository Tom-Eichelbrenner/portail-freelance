"use client";

import { useState, useRef } from "react";
import {
  Folder,
  Upload,
  UploadCloud,
  FileText,
  FileArchive,
  Image,
  File,
  Download,
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  createdAt: string;
}

interface Props {
  projectId: string;
  initialFiles: UploadedFile[];
  viewerType: "freelance" | "client";
}

const MAX_SIZE = 50 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function FileIcon({ mimeType }: { mimeType: string }) {
  const Icon = mimeType.startsWith("image/")
    ? Image
    : mimeType === "application/pdf" || mimeType.includes("text")
      ? FileText
      : mimeType.includes("zip") ||
          mimeType.includes("tar") ||
          mimeType.includes("rar")
        ? FileArchive
        : File;
  return <Icon size={17} strokeWidth={1.8} color="var(--indigo-600)" />;
}

export default function FileUpload({
  projectId,
  initialFiles,
  viewerType,
}: Props) {
  const [fileList, setFileList] = useState(initialFiles);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError("Fichier trop volumineux (max 50 Mo)");
      return;
    }
    setProgress(0);
    try {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        }),
      });
      if (!presignRes.ok) {
        const err = await presignRes.json();
        setError(err.error ?? "Erreur lors de la préparation de l'upload");
        setProgress(null);
        return;
      }
      const { uploadUrl, fileId } = await presignRes.json();
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload échoué : ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Erreur réseau"));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader(
          "Content-Type",
          file.type || "application/octet-stream",
        );
        xhr.send(file);
      });
      setFileList((prev) => [
        ...prev,
        {
          id: fileId,
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          uploadedBy: viewerType,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setProgress(null);
      setDragOver(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

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
          <Folder size={18} strokeWidth={1.8} color="var(--indigo-500)" />
          <span style={{ fontSize: 15, fontWeight: 600 }}>Fichiers</span>
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
            {fileList.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 32,
            padding: "0 12px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-primary)",
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
          }}
        >
          <Upload size={15} strokeWidth={2} />
          Importer
        </button>
        <input
          ref={inputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleInputChange}
        />
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px" }}>
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "26px 20px",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            border: `1.5px dashed ${dragOver ? "var(--indigo-400)" : "var(--border-strong)"}`,
            background: dragOver ? "var(--indigo-50)" : "var(--surface-sunken)",
            transition: "all 0.15s ease-out",
          }}
        >
          <UploadCloud size={26} strokeWidth={1.6} color="var(--indigo-500)" />
          {progress !== null ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 10 }}>
                Upload en cours… {progress}%
              </div>
              <div
                style={{
                  marginTop: 8,
                  width: 160,
                  height: 4,
                  borderRadius: 9999,
                  background: "var(--border-default)",
                }}
              >
                <div
                  style={{
                    height: 4,
                    borderRadius: 9999,
                    background: "var(--indigo-500)",
                    width: `${progress}%`,
                    transition: "width 0.2s",
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 10 }}>
                Glissez vos fichiers ici
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginTop: 3,
                }}
              >
                ou{" "}
                <span style={{ color: "var(--text-link)", fontWeight: 600 }}>
                  parcourir
                </span>{" "}
                depuis votre ordinateur
              </div>
            </>
          )}
        </div>

        {error && (
          <p
            style={{ fontSize: 13, color: "var(--red-600)", margin: "8px 0 0" }}
          >
            {error}
          </p>
        )}

        {/* File list */}
        {fileList.length > 0 && (
          <div
            style={{ marginTop: 14, display: "flex", flexDirection: "column" }}
          >
            {fileList.map((f) => (
              <div
                key={f.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 96px 36px",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 4px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
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
                      borderRadius: "var(--radius-md)",
                      background: "var(--indigo-50)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileIcon mimeType={f.mimeType} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {f.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {formatBytes(f.sizeBytes)}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                  {formatDate(f.createdAt)}
                </span>
                <a
                  href={`/api/uploads/download?fileId=${f.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    justifyContent: "flex-end",
                    color: "var(--slate-400)",
                  }}
                >
                  <Download size={17} strokeWidth={1.8} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
