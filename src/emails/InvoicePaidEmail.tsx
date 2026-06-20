interface Props {
  amount: number;
  description: string;
}

export default function InvoicePaidEmail({ amount, description }: Props) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "16px", color: "#16a34a" }}>
        Facture payée ✓
      </h1>
      <p>Bonne nouvelle !</p>
      <p>Votre facture a été réglée avec succès.</p>
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
              Montant reçu
            </td>
            <td style={{ padding: "8px 12px", border: "1px solid #e5e7eb" }}>
              {amount}€
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        Le paiement a été traité par Stripe et sera disponible selon votre
        calendrier de versement habituel.
      </p>
    </div>
  );
}
