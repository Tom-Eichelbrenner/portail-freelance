"use client";

import { useState, useRef } from "react";

interface UploadedFile {
  id: string;
  name: string;
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

export default function FileUpload({
  projectId,
  initialFiles,
  viewerType,
}: Props) {
  const [fileList, setFileList] = useState(initialFiles);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
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
          sizeBytes: file.size,
          uploadedBy: viewerType,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setProgress(null);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const uploaderLabel = (uploadedBy: string) => {
    if (uploadedBy === viewerType) return "Vous";
    return viewerType === "freelance" ? "Client" : "Votre prestataire";
  };

  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
        Fichiers
      </p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-300 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
        />
        <p className="text-xs text-gray-400">
          {progress !== null
            ? `Upload en cours… ${progress}%`
            : "Cliquez ou déposez un fichier (max 50 Mo)"}
        </p>
        {progress !== null && (
          <div className="mt-2 bg-gray-100 rounded-full h-1">
            <div
              className="bg-indigo-500 h-1 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {fileList.length > 0 && (
        <ul className="mt-2 divide-y divide-gray-100 border border-gray-200 rounded-lg">
          {fileList.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between px-3 py-2 text-xs"
            >
              <div className="truncate">
                <span className="font-medium text-gray-800">{f.name}</span>
                <span className="text-gray-400 ml-2">
                  {formatBytes(f.sizeBytes)}
                </span>
                <span className="text-gray-400 ml-2">
                  par {uploaderLabel(f.uploadedBy)}
                </span>
              </div>
              <a
                href={`/api/uploads/download?fileId=${f.id}`}
                className="text-indigo-600 hover:underline ml-3 shrink-0"
                target="_blank"
                rel="noopener noreferrer"
              >
                Télécharger
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
