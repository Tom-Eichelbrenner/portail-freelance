import { requireAuth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import ReglagesView from "@/components/dashboard/ReglagesView";

export default async function SettingsPage() {
  const { user, workspace } = await requireAuth();

  let renewalDate: string | null = null;
  if (user.subscriptionId && user.subscriptionStatus === "active") {
    try {
      const sub = await stripe.subscriptions.retrieve(user.subscriptionId);
      renewalDate = new Date(
        (sub as unknown as { current_period_end: number }).current_period_end *
          1000,
      ).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      // Stripe unavailable — leave null
    }
  }

  return (
    <ReglagesView
      userName={user.fullName ?? user.email}
      userEmail={user.email}
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
      accentColor={workspace.accentColor}
      subscriptionPlan={user.subscriptionPlan}
      subscriptionStatus={user.subscriptionStatus}
      renewalDate={renewalDate}
    />
  );
}
