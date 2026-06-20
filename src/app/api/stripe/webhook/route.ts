import { createElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices, users, workspaces } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import InvoicePaidEmail from "@/emails/InvoicePaidEmail";

const PRICE_SOLO = process.env.STRIPE_PRICE_SOLO!;
const PRICE_PRO = process.env.STRIPE_PRICE_PRO!;

function planFromPriceId(priceId: string): string | null {
  if (priceId === PRICE_SOLO) return "solo";
  if (priceId === PRICE_PRO) return "pro";
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.log("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Stripe webhook:", event.type, event.id);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "subscription") {
        const userId = session.metadata?.userId;
        if (!userId) break;

        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription?.id ?? null);

        let plan: string | null = null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const priceId = sub.items.data[0]?.price.id ?? "";
          plan = planFromPriceId(priceId);
        }

        await db
          .update(users)
          .set({
            subscriptionStatus: "active",
            subscriptionId: subId,
            subscriptionPlan: plan,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
        break;
      }

      // Payment Link checkout
      if (session.payment_link) {
        const paymentLinkId =
          typeof session.payment_link === "string"
            ? session.payment_link
            : session.payment_link.id;

        const [invoice] = await db
          .select()
          .from(invoices)
          .where(eq(invoices.stripePaymentLinkId, paymentLinkId))
          .limit(1);

        if (!invoice) break;

        await db
          .update(invoices)
          .set({ status: "paid", paidAt: new Date() })
          .where(eq(invoices.id, invoice.id));

        // Email the freelance
        const [wsRow] = await db
          .select({ user: users })
          .from(workspaces)
          .innerJoin(users, eq(users.id, workspaces.userId))
          .where(eq(workspaces.id, invoice.workspaceId))
          .limit(1);

        if (wsRow) {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
            to: wsRow.user.email,
            subject: `Facture payée — ${invoice.amount / 100}€ reçus`,
            react: createElement(InvoicePaidEmail, {
              amount: invoice.amount / 100,
              description: invoice.description,
            }),
          });
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const priceId = sub.items.data[0]?.price.id ?? "";
      const plan = planFromPriceId(priceId);
      const status = sub.status === "active" ? "active" : "inactive";

      await db
        .update(users)
        .set({
          subscriptionStatus: status,
          subscriptionId: sub.id,
          subscriptionPlan: plan,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;

      await db
        .update(users)
        .set({
          subscriptionStatus: "inactive",
          subscriptionId: null,
          subscriptionPlan: null,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }

    default:
      console.log("Stripe webhook unhandled:", event.type);
  }

  return NextResponse.json({ received: true });
}
