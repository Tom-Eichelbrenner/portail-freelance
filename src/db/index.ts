import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var _pgClient: ReturnType<typeof postgres> | undefined;
}

// In dev, Turbopack re-evaluates modules on every hot reload without closing
// the old postgres.js pool. Each pool defaults to 10 connections, which
// quickly exhausts the session pooler's 15-connection limit.
// Singleton on globalThis + max:1 keeps us at exactly 1 connection total.
const client =
  globalThis._pgClient ?? postgres(process.env.DATABASE_URL!, { max: 1 });

if (process.env.NODE_ENV !== "production") globalThis._pgClient = client;

export const db = drizzle(client, { schema });
