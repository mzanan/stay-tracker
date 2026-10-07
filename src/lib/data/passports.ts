import { and, asc, eq } from "drizzle-orm";

import { db, type DbExecutor } from "@/lib/db";
import { passports } from "@/lib/db/schema";
import type { PassportInput } from "@/lib/schemas/passports";
import type { Passport } from "@/types/db";

export async function listPassports(
  userId: string,
  executor: DbExecutor = db,
): Promise<Passport[]> {
  return executor
    .select()
    .from(passports)
    .where(eq(passports.user_id, userId))
    .orderBy(asc(passports.created_at));
}

export async function insertPassport(
  userId: string,
  values: PassportInput,
): Promise<Passport | null> {
  const [row] = await db
    .insert(passports)
    .values({ ...values, user_id: userId })
    .onConflictDoNothing()
    .returning();
  return row ?? null;
}

export async function updatePassportExpiry(
  userId: string,
  id: string,
  expiresOn: string | null,
): Promise<boolean> {
  const rows = await db
    .update(passports)
    .set({ expires_on: expiresOn })
    .where(and(eq(passports.user_id, userId), eq(passports.id, id)))
    .returning({ id: passports.id });
  return rows.length > 0;
}

export async function deletePassport(userId: string, id: string): Promise<boolean> {
  const rows = await db
    .delete(passports)
    .where(and(eq(passports.user_id, userId), eq(passports.id, id)))
    .returning({ id: passports.id });
  return rows.length > 0;
}
