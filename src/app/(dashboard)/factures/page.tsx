import { and, asc, eq, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { clients, invoices, projects } from "@/db/schema";
import InvoicesTable, {
  type InvoiceRow,
} from "@/components/dashboard/InvoicesTable";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const LATE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

export default async function FacturesPage() {
  const { workspace } = await requireAuth();

  const rows = await db
    .select({
      id: invoices.id,
      amountCents: invoices.amount,
      status: invoices.status,
      createdAt: invoices.createdAt,
      clientName: clients.name,
      projectName: projects.name,
    })
    .from(invoices)
    .innerJoin(projects, eq(projects.id, invoices.projectId))
    .innerJoin(clients, eq(clients.id, invoices.clientId))
    .where(
      and(
        eq(invoices.workspaceId, workspace.id),
        isNull(invoices.deletedAt),
        isNull(projects.deletedAt),
        isNull(clients.deletedAt),
      ),
    )
    .orderBy(asc(invoices.createdAt));

  // Build per-year counters to generate FAC-YYYY-NNN numbers
  const yearCounters = new Map<number, number>();

  const invoiceRows: InvoiceRow[] = rows.map((r) => {
    const year = r.createdAt.getFullYear();
    const n = (yearCounters.get(year) ?? 0) + 1;
    yearCounters.set(year, n);

    const now = Date.now();
    const isLate =
      r.status === "pending" && now - r.createdAt.getTime() > LATE_THRESHOLD_MS;

    return {
      id: r.id,
      num: `FAC-${year}-${String(n).padStart(3, "0")}`,
      clientName: r.clientName,
      clientInitials: initials(r.clientName) || "?",
      projectName: r.projectName,
      amountCents: r.amountCents,
      status: r.status === "paid" ? "paid" : isLate ? "late" : "pending",
      createdAtISO: r.createdAt.toISOString(),
    };
  });

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <InvoicesTable rows={invoiceRows} />
    </main>
  );
}
