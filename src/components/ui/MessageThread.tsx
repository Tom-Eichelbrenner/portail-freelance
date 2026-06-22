"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send } from "lucide-react";
import { postMessage } from "@/app/actions/messages";

interface Message {
  id: string;
  content: string;
  authorType: string;
  createdAt: string;
}

interface Props {
  projectId: string;
  initialMessages: Message[];
  viewerType: "freelance" | "client";
  freelanceName?: string;
  clientName?: string;
}

const AVATAR_PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function avatarColor(name: string) {
  return AVATAR_PALETTE[(name.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export default function MessageThread({
  projectId,
  initialMessages,
  viewerType,
  freelanceName = "Vous",
  clientName = "Client",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [compose, setCompose] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [initialMessages.length]);

  function sendMessage() {
    const text = compose.trim();
    if (!text || isPending) return;
    setCompose("");
    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("content", text);
    startTransition(async () => {
      await postMessage(formData);
      router.refresh();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
          gap: 10,
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <MessageSquare size={18} strokeWidth={1.8} color="var(--indigo-500)" />
        <span style={{ fontSize: 15, fontWeight: 600 }}>Messages</span>
      </div>

      {/* Messages */}
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          maxHeight: 400,
          overflowY: "auto",
        }}
      >
        {initialMessages.length === 0 && (
          <p
            style={{
              fontSize: 13.5,
              color: "var(--text-tertiary)",
              textAlign: "center",
              margin: "12px 0",
            }}
          >
            Aucun message pour le moment.
          </p>
        )}
        {initialMessages.map((m) => {
          const isMine = m.authorType === viewerType;
          const displayName = isMine
            ? "Vous"
            : m.authorType === "freelance"
              ? freelanceName
              : clientName;
          const color = avatarColor(displayName);
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: isMine ? "row-reverse" : "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9999,
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: color,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                  boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)",
                }}
              >
                {initials(displayName)}
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                  maxWidth: "76%",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-tertiary)",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{ fontWeight: 600, color: "var(--text-secondary)" }}
                  >
                    {displayName}
                  </span>
                  {" · "}
                  {relativeTime(m.createdAt)}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.5,
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: isMine
                      ? "var(--indigo-500)"
                      : "var(--surface-sunken)",
                    color: isMine ? "#fff" : "var(--text-primary)",
                    border: isMine ? "none" : "1px solid var(--border-subtle)",
                    borderTopRightRadius: isMine ? 4 : 14,
                    borderTopLeftRadius: isMine ? 14 : 4,
                  }}
                >
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--surface-sunken)",
        }}
      >
        <input
          value={compose}
          onChange={(e) => setCompose(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message…"
          style={{
            flex: 1,
            height: 42,
            padding: "0 14px",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            background: "var(--surface-card)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            outline: "none",
            color: "var(--text-primary)",
          }}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={isPending || !compose.trim()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            height: 40,
            padding: "0 16px",
            fontSize: 13.5,
            fontWeight: 600,
            background: "var(--indigo-600)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: isPending || !compose.trim() ? "default" : "pointer",
            opacity: isPending || !compose.trim() ? 0.6 : 1,
            transition: "opacity 0.15s",
          }}
        >
          <Send size={16} strokeWidth={2} />
          Envoyer
        </button>
      </div>
    </section>
  );
}
