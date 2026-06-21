export const STATUS_LABELS: Record<string, string> = {
  todo: "À démarrer",
  in_progress: "En cours",
  delivered: "Livré",
  approved: "Validé ✓",
};

export const STATUS_CLASSES: Record<string, string> = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  delivered: "bg-orange-100 text-orange-700",
  approved: "bg-green-100 text-green-700",
};

export const STATUSES = [
  "todo",
  "in_progress",
  "delivered",
  "approved",
] as const;

export type Tone = "neutral" | "primary" | "warning" | "success";

export const STATUS_TONE: Record<string, Tone> = {
  todo: "neutral",
  in_progress: "primary",
  delivered: "warning",
  approved: "success",
};

export const TONE_STYLE: Record<Tone, { bg: string; fg: string; dot: string }> =
  {
    neutral: {
      bg: "var(--slate-100)",
      fg: "var(--slate-700)",
      dot: "var(--slate-400)",
    },
    primary: {
      bg: "var(--indigo-50)",
      fg: "var(--indigo-700)",
      dot: "var(--indigo-500)",
    },
    warning: {
      bg: "var(--amber-50)",
      fg: "var(--amber-600)",
      dot: "var(--amber-500)",
    },
    success: {
      bg: "var(--emerald-50)",
      fg: "var(--emerald-700)",
      dot: "var(--emerald-500)",
    },
  };
