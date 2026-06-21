"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Send, Phone, Info } from "lucide-react";
import { postMessage } from "@/app/actions/messages";

export type ConversationItem = {
  id: string;
  projectName: string;
  clientName: string;
  clientInitials: string;
  avBg: string;
  avFg: string;
  lastMessage: string;
  lastMessageFrom: "freelance" | "client";
  lastMessageTime: string;
};

export type MessageItem = {
  id: string;
  content: string;
  authorType: "freelance" | "client";
  createdAtISO: string;
  time: string;
};

interface Props {
  conversations: ConversationItem[];
  allMessagesByProject: Record<string, MessageItem[]>;
  defaultActiveId: string | null;
  accentColor: string;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const yesterday = new Date(todayDay.getTime() - 86400000);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (msgDay.getTime() === todayDay.getTime()) return "Aujourd'hui";
  if (msgDay.getTime() === yesterday.getTime()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

function now(): string {
  const d = new Date();
  return (
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}

export default function MessagesView({
  conversations,
  allMessagesByProject,
  defaultActiveId,
  accentColor,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(defaultActiveId);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] =
    useState<Record<string, MessageItem[]>>(allMessagesByProject);
  const threadRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [selectedId, localMessages]);

  const filtered = conversations.filter(
    (c) =>
      !query ||
      c.clientName.toLowerCase().includes(query.toLowerCase()) ||
      c.projectName.toLowerCase().includes(query.toLowerCase()),
  );

  const active = conversations.find((c) => c.id === selectedId);
  const thread = selectedId ? (localMessages[selectedId] ?? []) : [];
  const dayHeader =
    thread.length > 0 ? dayLabel(thread[0].createdAtISO) : "Aujourd'hui";

  function send() {
    const text = draft.trim();
    if (!text || !selectedId) return;

    const optimistic: MessageItem = {
      id: `opt-${Date.now()}`,
      content: text,
      authorType: "freelance",
      createdAtISO: new Date().toISOString(),
      time: now(),
    };

    setLocalMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), optimistic],
    }));
    setDraft("");

    const fd = new FormData();
    fd.set("projectId", selectedId);
    fd.set("content", text);

    startTransition(async () => {
      await postMessage(fd);
      router.refresh();
    });
  }

  return (
    <div
      className="flex min-w-0 flex-1 overflow-hidden"
      style={{ fontFamily: "var(--font-sans)", color: "var(--text-primary)" }}
    >
      {/* ===== Left sidebar ===== */}
      <aside
        style={{
          width: 340,
          flexShrink: 0,
          borderRight: "1px solid var(--border-default)",
          display: "flex",
          flexDirection: "column",
          background: "var(--surface-page)",
        }}
      >
        <div
          style={{
            padding: "22px 20px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Messages
          </h2>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--surface-sunken)",
              border: "1px solid var(--border-default)",
              padding: "3px 9px",
              borderRadius: 9999,
            }}
          >
            {conversations.length}{" "}
            {conversations.length === 1 ? "projet" : "projets"}
          </span>
        </div>

        <div style={{ padding: "0 16px 14px" }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 11,
                color: "var(--text-tertiary)",
                pointerEvents: "none",
              }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un projet"
              style={{
                width: "100%",
                height: 38,
                padding: "0 12px 0 34px",
                fontFamily: "inherit",
                fontSize: 14,
                color: "var(--text-primary)",
                background: "var(--surface-sunken)",
                border: "1px solid var(--border-default)",
                borderRadius: 8,
                outline: "none",
              }}
            />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 8px 12px",
          }}
        >
          {filtered.length === 0 && (
            <p
              style={{
                padding: "12px",
                fontSize: 13,
                color: "var(--text-tertiary)",
                textAlign: "center",
              }}
            >
              Aucun projet trouvé
            </p>
          )}
          {filtered.map((conv) => {
            const isSelected = conv.id === selectedId;
            const preview =
              (conv.lastMessageFrom === "freelance" ? "Vous : " : "") +
              conv.lastMessage;
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  gap: 12,
                  padding: "11px 12px",
                  marginBottom: 2,
                  cursor: "pointer",
                  borderRadius: 10,
                  alignItems: "center",
                  background: isSelected
                    ? "var(--color-primary-subtle)"
                    : "transparent",
                  border: "none",
                  textAlign: "left",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--surface-sunken)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: 9999,
                    background: conv.avBg,
                    color: conv.avFg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {conv.clientInitials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {conv.clientName}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-tertiary)",
                        flexShrink: 0,
                      }}
                    >
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-tertiary)",
                      margin: "1px 0 3px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {conv.projectName}
                  </div>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {preview || "Aucun message"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ===== Thread pane ===== */}
      {active ? (
        <section
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            background: "var(--surface-sunken)",
          }}
        >
          {/* Header */}
          <header
            style={{
              flexShrink: 0,
              padding: "14px 24px",
              background: "var(--surface-page)",
              borderBottom: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 40,
                height: 40,
                borderRadius: 9999,
                background: active.avBg,
                color: active.avFg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {active.clientInitials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>
                {active.clientName}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  marginTop: 2,
                }}
              >
                {active.projectName}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[Phone, Info].map((Icon, i) => (
                <button
                  key={i}
                  style={{
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    borderRadius: 8,
                    background: "transparent",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--surface-sunken)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--text-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--text-tertiary)";
                  }}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </button>
              ))}
            </div>
          </header>

          {/* Thread */}
          <div
            ref={threadRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                alignSelf: "center",
                margin: "2px 0 8px",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-tertiary)",
                background: "var(--surface-page)",
                border: "1px solid var(--border-default)",
                padding: "4px 12px",
                borderRadius: 9999,
              }}
            >
              {dayHeader}
            </div>

            {thread.length === 0 && (
              <p
                style={{
                  alignSelf: "center",
                  fontSize: 13,
                  color: "var(--text-tertiary)",
                  marginTop: 32,
                }}
              >
                Aucun message pour le moment. Démarrez la conversation !
              </p>
            )}

            {thread.map((msg) =>
              msg.authorType === "client" ? (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-end",
                    maxWidth: "78%",
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 26,
                      height: 26,
                      borderRadius: 9999,
                      background: active.avBg,
                      color: active.avFg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {active.clientInitials}
                  </div>
                  <div
                    style={{
                      padding: "9px 13px",
                      background: "var(--surface-page)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      borderRadius: 14,
                      borderBottomLeftRadius: 4,
                      boxShadow: "var(--shadow-xs)",
                    }}
                  >
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                      {msg.content}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-tertiary)",
                        marginTop: 4,
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={msg.id}
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "9px 13px",
                      background: accentColor,
                      color: "#fff",
                      borderRadius: 14,
                      borderBottomRightRadius: 4,
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                      {msg.content}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.7)",
                        marginTop: 4,
                        textAlign: "right",
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Input */}
          <div
            style={{
              flexShrink: 0,
              padding: "14px 24px 18px",
              background: "var(--surface-page)",
              borderTop: "1px solid var(--border-default)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                background: "var(--surface-sunken)",
                border: "1px solid var(--border-default)",
                borderRadius: 14,
                padding: "6px 6px 6px 14px",
              }}
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Écrivez votre message…"
                disabled={isPending}
                style={{
                  flex: 1,
                  resize: "none",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: "inherit",
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "var(--text-primary)",
                  padding: "8px 0",
                  maxHeight: 140,
                }}
              />
              <button
                onClick={send}
                disabled={isPending || !draft.trim()}
                aria-label="Envoyer"
                style={{
                  flexShrink: 0,
                  width: 38,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  borderRadius: 9,
                  background: accentColor,
                  color: "#fff",
                  cursor: isPending || !draft.trim() ? "default" : "pointer",
                  opacity: isPending || !draft.trim() ? 0.5 : 1,
                  transition: "opacity 0.1s ease",
                }}
              >
                <Send size={18} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface-sunken)",
          }}
        >
          <p style={{ fontSize: 14, color: "var(--text-tertiary)" }}>
            Sélectionnez une conversation
          </p>
        </section>
      )}
    </div>
  );
}
