import { and, desc, eq } from "drizzle-orm";

import { listPassports } from "@/lib/data/passports";
import { db, type DbExecutor } from "@/lib/db";
import { stays } from "@/lib/db/schema";
import type { StayInput } from "@/lib/schemas/stays";
import { validateStay, type StayConflict } from "@/lib/stays";
import type { Stay } from "@/types/db";

export type StayWriteResult =
  | { kind: "ok"; id: string }
  | { kind: "conflict"; conflict: StayConflict }
  | { kind: "notFound" };

export async function listStays(
  userId: string,
  executor: DbExecutor = db,
): Promise<Stay[]> {
  return executor
    .select()
    .from(stays)
    .where(eq(stays.user_id, userId))
    .orderBy(desc(stays.entry_date), desc(stays.created_at));
}

async function findStayConflict(
  executor: DbExecutor,
  userId: string,
  input: StayInput,
  today: string,
  ignoreStayId?: string,
): Promise<StayConflict | null> {
  const [existingStays, passports] = await Promise.all([
    listStays(userId, executor),
    listPassports(userId, executor),
  ]);
  return validateStay(
    input,
    existingStays,
    passports.map((passport) => passport.id),
    today,
    ignoreStayId,
  );
}

export async function insertStay(
  userId: string,
  input: StayInput,
  today: string,
): Promise<StayWriteResult> {
  return db.transaction(async (tx) => {
    const conflict = await findStayConflict(tx, userId, input, today);
    if (conflict) return { kind: "conflict", conflict };
    const [row] = await tx
      .insert(stays)
      .values({ ...input, user_id: userId })
      .returning({ id: stays.id });
    return { kind: "ok", id: row.id };
  });
}

export async function updateStay(
  userId: string,
  id: string,
  input: StayInput,
  today: string,
): Promise<StayWriteResult> {
  const ownedBy = and(eq(stays.user_id, userId), eq(stays.id, id));
  return db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: stays.id }).from(stays).where(ownedBy);
    if (!existing) return { kind: "notFound" };
    const conflict = await findStayConflict(tx, userId, input, today, id);
    if (conflict) return { kind: "conflict", conflict };
    await tx.update(stays).set(input).where(ownedBy);
    return { kind: "ok", id };
  });
}

export async function deleteStay(userId: string, id: string): Promise<boolean> {
  const rows = await db
    .delete(stays)
    .where(and(eq(stays.user_id, userId), eq(stays.id, id)))
    .returning({ id: stays.id });
  return rows.length > 0;
}
