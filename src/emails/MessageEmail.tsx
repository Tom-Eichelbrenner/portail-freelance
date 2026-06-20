interface Props {
  recipientName: string;
  senderName: string;
  projectName: string;
  content: string;
  link: string;
}

export default function MessageEmail({
  recipientName,
  senderName,
  projectName,
  content,
  link,
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
        Nouveau message
      </h1>
      <p>Bonjour {recipientName},</p>
      <p>
        <strong>{senderName}</strong> vous a envoyé un message sur le projet{" "}
        <strong>{projectName}</strong> :
      </p>
      <blockquote
        style={{
          borderLeft: "4px solid #e5e7eb",
          paddingLeft: "16px",
          margin: "16px 0",
          color: "#374151",
          fontStyle: "italic",
        }}
      >
        {content}
      </blockquote>
      <p>
        <a
          href={link}
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
          Répondre
        </a>
      </p>
    </div>
  );
}
