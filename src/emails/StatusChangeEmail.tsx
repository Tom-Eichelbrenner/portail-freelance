interface Props {
  clientName: string;
  projectName: string;
  newStatus: string;
  statusLabel: string;
  portalLink: string;
}

const STATUS_COLORS: Record<string, string> = {
  todo: "#6b7280",
  in_progress: "#3b82f6",
  delivered: "#f97316",
  approved: "#22c55e",
};

export default function StatusChangeEmail({
  clientName,
  projectName,
  newStatus,
  statusLabel,
  portalLink,
}: Props) {
  const color = STATUS_COLORS[newStatus] ?? "#6b7280";

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
        Mise à jour de votre projet
      </h1>
      <p>Bonjour {clientName},</p>
      <p>
        Le statut de votre projet <strong>{projectName}</strong> a été mis à
        jour :
      </p>
      <p>
        <span
          style={{
            display: "inline-block",
            backgroundColor: color,
            color: "#ffffff",
            padding: "4px 16px",
            borderRadius: "9999px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {statusLabel}
        </span>
      </p>
      <p>
        <a
          href={portalLink}
          style={{
            display: "inline-block",
            backgroundColor: "#6366f1",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Voir mon portail
        </a>
      </p>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        Vous recevez cet email car vous avez un projet avec votre prestataire.
      </p>
    </div>
  );
}
