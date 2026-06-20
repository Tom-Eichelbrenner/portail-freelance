"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProjectStatus } from "@/app/actions/projects";
import { STATUS_LABELS, STATUS_CLASSES } from "@/lib/project-statuses";

const STATUSES = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
  className: STATUS_CLASSES[value] ?? "bg-gray-100 text-gray-700",
}));

interface Props {
  projectId: string;
  currentStatus: string;
}

export default function StatusButton({ projectId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  const currentStyle =
    STATUSES.find((s) => s.value === status)?.className ??
    "bg-gray-100 text-gray-700";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    const prev = status;
    setStatus(newStatus);
    startTransition(async () => {
      const result = await updateProjectStatus(projectId, newStatus);
      if (result.error) {
        setStatus(prev);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className={`text-xs font-medium rounded-full px-3 py-1 cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 ${currentStyle}`}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
