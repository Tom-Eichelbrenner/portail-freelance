import {
  pgTable,
  uuid,
  text,
  bigint,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").unique().notNull(),
  fullName: text("full_name"),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: text("subscription_status").notNull().default("inactive"),
  subscriptionId: text("subscription_id"),
  subscriptionPlan: text("subscription_plan"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ...timestamps,
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  logoUrl: text("logo_url"),
  accentColor: text("accent_color").notNull().default("#6366f1"),
  ...timestamps,
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  inviteToken: text("invite_token").unique(),
  inviteExpiresAt: timestamp("invite_expires_at", { withTimezone: true }),
  firstAccessedAt: timestamp("first_accessed_at", { withTimezone: true }),
  ...timestamps,
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ...timestamps,
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  name: text("name").notNull(),
  r2Key: text("r2_key").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  ...timestamps,
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  authorType: text("author_type").notNull(),
  content: text("content").notNull(),
  ...timestamps,
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id),
  stripePaymentLinkId: text("stripe_payment_link_id").notNull(),
  stripePaymentLinkUrl: text("stripe_payment_link_url").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("EUR"),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  ...timestamps,
});

export const notificationQueue = pgTable("notification_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  error: text("error"),
  ...timestamps,
});
