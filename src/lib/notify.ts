import { eq } from "drizzle-orm";
import type { ReactElement } from "react";
import { db } from "@/db";
import { notificationQueue } from "@/db/schema";
import { resend } from "@/lib/resend";

interface SendNotificationOptions {
  to: string;
  subject: string;
  react: ReactElement;
  type: string;
  payload: Record<string, unknown>;
}

export async function sendNotification(options: SendNotificationOptions) {
  const { to, subject, react, type, payload } = options;

  const [queued] = await db
    .insert(notificationQueue)
    .values({ type, payload })
    .returning({ id: notificationQueue.id });

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      react,
    });

    if (error) {
      await db
        .update(notificationQueue)
        .set({ error: error.message })
        .where(eq(notificationQueue.id, queued.id));
    } else {
      await db
        .update(notificationQueue)
        .set({ sentAt: new Date() })
        .where(eq(notificationQueue.id, queued.id));
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(notificationQueue)
      .set({ error: message })
      .where(eq(notificationQueue.id, queued.id));
  }
}
