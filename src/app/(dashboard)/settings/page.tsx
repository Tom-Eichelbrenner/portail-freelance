import { requireAuth } from "@/lib/auth";
import ReglagesView from "@/components/dashboard/ReglagesView";

export default async function SettingsPage() {
  const { user, workspace } = await requireAuth();

  return (
    <ReglagesView
      userName={user.fullName ?? user.email}
      userEmail={user.email}
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
      accentColor={workspace.accentColor}
      subscriptionPlan={user.subscriptionPlan}
    />
  );
}
