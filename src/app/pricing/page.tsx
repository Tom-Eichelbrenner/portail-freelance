import { getUserWorkspace } from "@/lib/auth";
import {
  createCheckoutSession,
  createBillingPortalSession,
  upgradeSubscription,
} from "@/app/actions/stripe";

const PRICE_SOLO = process.env.STRIPE_PRICE_SOLO!;
const PRICE_PRO = process.env.STRIPE_PRICE_PRO!;

export default async function PricingPage() {
  const data = await getUserWorkspace();
  const user = data?.user;
  const isActive = user?.subscriptionStatus === "active";
  const currentPlan = user?.subscriptionPlan;

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Choisissez votre plan</h1>
          <p className="text-gray-500">
            Commencez dès aujourd&apos;hui. Annulez à tout moment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Solo */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">Solo</h2>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold">19€</span>
                <span className="text-gray-500 mb-1">/mois</span>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-gray-600 mb-8 flex-1">
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>5 clients
                actifs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Stockage 5 Go
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Partage de fichiers
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Messagerie
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Statut de mission
              </li>
            </ul>

            {isActive && currentPlan === "solo" ? (
              <form action={createBillingPortalSession}>
                <button
                  type="submit"
                  className="w-full border border-indigo-600 text-indigo-600 rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-50"
                >
                  Gérer mon abonnement
                </button>
              </form>
            ) : isActive && currentPlan === "pro" ? (
              <form action={upgradeSubscription.bind(null, PRICE_SOLO)}>
                <button
                  type="submit"
                  className="w-full border border-gray-300 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  Passer au Solo
                </button>
              </form>
            ) : (
              <form action={createCheckoutSession.bind(null, PRICE_SOLO)}>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700"
                >
                  Commencer
                </button>
              </form>
            )}
          </div>

          {/* Pro */}
          <div className="bg-white rounded-xl border-2 border-indigo-600 p-8 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Recommandé
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">Pro</h2>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold">39€</span>
                <span className="text-gray-500 mb-1">/mois</span>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-gray-600 mb-8 flex-1">
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Clients illimités
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Stockage 20 Go
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Partage de fichiers
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Messagerie
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Statut de mission
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Facturation client intégrée
              </li>
            </ul>

            {isActive && currentPlan === "pro" ? (
              <form action={createBillingPortalSession}>
                <button
                  type="submit"
                  className="w-full border border-indigo-600 text-indigo-600 rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-50"
                >
                  Gérer mon abonnement
                </button>
              </form>
            ) : isActive && currentPlan === "solo" ? (
              <form action={upgradeSubscription.bind(null, PRICE_PRO)}>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700"
                >
                  Passer au Pro
                </button>
              </form>
            ) : (
              <form action={createCheckoutSession.bind(null, PRICE_PRO)}>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700"
                >
                  Commencer
                </button>
              </form>
            )}
          </div>
        </div>

        {user && (
          <p className="text-center text-sm text-gray-500 mt-8">
            Connecté en tant que{" "}
            <span className="font-medium">{user.email}</span>.{" "}
            <a href="/dashboard" className="text-indigo-600 hover:underline">
              Retour au dashboard
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
