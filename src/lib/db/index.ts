import "server-only";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;
type DrizzleTransaction = Parameters<Parameters<DrizzleDb["transaction"]>[0]>[0];

export type DbExecutor = DrizzleDb | DrizzleTransaction;

let cached: DrizzleDb | null = null;

function init(): DrizzleDb {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not set");
  }
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema });
}

export const db = new Proxy({} as DrizzleDb, {
  get(_, prop) {
    if (!cached) cached = init();
    return (cached as unknown as Record<string | symbol, unknown>)[prop];
  },
});
