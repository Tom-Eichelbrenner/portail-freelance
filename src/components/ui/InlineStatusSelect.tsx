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
  const tone = STATUS_TONE[status] ?? "neutral";
  const s = TONE_STYLE[tone];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const prev = status;
    setStatus(next);
    startTransition(async () => {
      const result = await updateProjectStatus(projectId, next);
      if (result.error) setStatus(prev);
      else router.refresh();
    });
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      onClick={(e) => e.stopPropagation()}
      style={{
        appearance: "none",
        border: "none",
        cursor: isPending ? "default" : "pointer",
        padding: "5px 10px",
        borderRadius: 9999,
        fontSize: 12.5,
        fontWeight: 600,
        background: s.bg,
        color: s.fg,
        opacity: isPending ? 0.6 : 1,
        outline: "none",
        fontFamily: "var(--font-sans)",
      }}
    >
      {STATUSES.map((v) => (
        <option key={v} value={v}>
          {STATUS_LABELS[v] ?? v}
        </option>
      ))}
    </select>
  );
}
