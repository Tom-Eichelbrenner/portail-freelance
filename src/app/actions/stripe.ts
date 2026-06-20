"use server";

import { createElement } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { clients, invoices, projects, users } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { requireAuth } from "@/lib/auth";
import { isPlanPro } from "@/lib/subscription";
import InvoiceEmail from "@/emails/InvoiceEmail";

export async function createCheckoutSession(priceId: string): Promise<void> {
  const { user, workspace } = await requireAuth();

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db
      .update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId: user.id },
  });

  redirect(session.url!);
}

export async function upgradeSubscription(priceId: string): Promise<void> {
  const { user } = await requireAuth();
  if (!user.subscriptionId) redirect("/pricing");

  const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) redirect("/pricing");

  await stripe.subscriptions.update(user.subscriptionId, {
    items: [{ id: itemId, price: priceId }],
    proration_behavior: "always_invoice",
  });

  // webhook customer.subscription.updated mettra à jour la DB
  redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
}

export async function createBillingPortalSession(): Promise<void> {
  const { user } = await requireAuth();
  if (!user.stripeCustomerId) redirect("/pricing");

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  redirect(session.url);
}

const invoiceSchema = z.object({
  projectId: z.string().uuid(),
  amount: z.coerce.number().int().positive(),
  description: z.string().min(1),
});

export type InvoiceState = { error: string | null; success: string | null };

export async function createInvoice(
  prevState: InvoiceState,
  formData: FormData,
): Promise<InvoiceState> {
  const { user, workspace } = await requireAuth();

  if (!isPlanPro(user.subscriptionPlan)) {
    return {
      error: "Cette fonctionnalité est réservée au plan Pro",
      success: null,
    };
  }

  const parsed = invoiceSchema.safeParse({
    projectId: formData.get("projectId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Données invalides",
      success: null,
    };
  }

  const { projectId, amount, description } = parsed.data;

  const rows = await db
    .select({ project: projects, client: clients })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.workspaceId, workspace.id),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!rows.length) return { error: "Projet introuvable", success: null };
  const { project, client } = rows[0];

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: description },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: { projectId, workspaceId: workspace.id },
  });

  await db.insert(invoices).values({
    workspaceId: workspace.id,
    projectId,
    clientId: client.id,
    stripePaymentLinkId: paymentLink.id,
    stripePaymentLinkUrl: paymentLink.url,
    amount: amount * 100,
    currency: "EUR",
    description,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to: client.email,
    subject: `Facture de ${workspace.name} — ${amount}€`,
    react: createElement(InvoiceEmail, {
      clientName: client.name,
      workspaceName: workspace.name,
      amount,
      description,
      paymentLink: paymentLink.url,
    }),
  });

  revalidatePath("/dashboard");
  return {
    error: null,
    success: `Facture de ${amount}€ envoyée à ${client.email}`,
  };
}
