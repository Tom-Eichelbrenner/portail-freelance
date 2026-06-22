"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProjectStatus } from "@/app/actions/projects";
import {
  STATUSES,
  STATUS_LABELS,
  STATUS_TONE,
  TONE_STYLE,
} from "@/lib/project-statuses";

export default function InlineStatusSelect({
  projectId,
  status: initialStatus,
}: {
  projectId: string;
  status: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  function handleClick(next: string) {
    if (next === status || isPending) return;
    const prev = status;
    setStatus(next);
    startTransition(async () => {
      const result = await updateProjectStatus(projectId, next);
      if (result.error) setStatus(prev);
      else router.refresh();
    });
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: 3,
        background: "var(--surface-sunken)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        opacity: isPending ? 0.7 : 1,
      }}
    >
      {STATUSES.map((key) => {
        const active = key === status;
        const tone = STATUS_TONE[key] ?? "neutral";
        const s = TONE_STYLE[tone];
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleClick(key)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 13px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              cursor: isPending ? "default" : "pointer",
              transition: "all 0.15s ease-out",
              whiteSpace: "nowrap",
              background: active ? "var(--surface-card)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: active ? 600 : 500,
              boxShadow: active ? "var(--shadow-xs)" : "none",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 9999,
                flexShrink: 0,
                background: active ? s.dot : "var(--slate-300)",
              }}
            />
            {STATUS_LABELS[key] ?? key}
          </button>
        );
      })}
    </div>
  );
}
