interface Props {
  clientName: string;
  workspaceName: string;
  portalLink: string;
}

export default function InviteEmail({
  clientName,
  workspaceName,
  portalLink,
}: Props) {
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
        Invitation au portail
      </h1>
      <p>Bonjour {clientName},</p>
      <p>
        Vous avez été invité à rejoindre le portail de{" "}
        <strong>{workspaceName}</strong>.
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
          Accéder au portail
        </a>
      </p>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        Ce lien est valable 7 jours. Si vous n'attendiez pas cette invitation,
        vous pouvez ignorer cet email.
      </p>
    </div>
  );
}
