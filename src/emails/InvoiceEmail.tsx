interface Props {
  clientName: string;
  workspaceName: string;
  amount: number;
  description: string;
  paymentLink: string;
}

export default function InvoiceEmail({
  clientName,
  workspaceName,
  amount,
  description,
  paymentLink,
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
        Nouvelle facture
      </h1>
      <p>Bonjour {clientName},</p>
      <p>
        Vous avez reçu une facture de <strong>{workspaceName}</strong>.
      </p>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          margin: "24px 0",
          fontSize: "14px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                padding: "8px 12px",
                background: "#f9fafb",
                fontWeight: "bold",
                border: "1px solid #e5e7eb",
              }}
            >
              Description
            </td>
            <td style={{ padding: "8px 12px", border: "1px solid #e5e7eb" }}>
              {description}
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: "8px 12px",
                background: "#f9fafb",
                fontWeight: "bold",
                border: "1px solid #e5e7eb",
              }}
            >
              Montant
            </td>
            <td style={{ padding: "8px 12px", border: "1px solid #e5e7eb" }}>
              {amount}€
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        <a
          href={paymentLink}
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
          Payer maintenant
        </a>
      </p>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        Ce lien de paiement est sécurisé et traité par Stripe.
      </p>
    </div>
  );
}
