import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, workspace } = await requireAuth();

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        background: "var(--surface-page)",
        color: "var(--text-primary)",
      }}
    >
      <DashboardSidebar
        userName={user.fullName ?? user.email}
        plan={user.subscriptionPlan ?? null}
        workspaceName={workspace.name}
      />
      {children}
    </div>
  );
}
