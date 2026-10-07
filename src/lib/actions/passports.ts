"use server";

import { runAuthedAction } from "@/lib/actionRunner";
import { MESSAGES } from "@/lib/constants/messages";
import { deletePassport, insertPassport, updatePassportExpiry } from "@/lib/data/passports";
import { idSchema } from "@/lib/schemas/common";
import { passportExpirySchema, passportInputSchema } from "@/lib/schemas/passports";
import { parseInput } from "@/lib/validation";
import type { ActionResult } from "@/types/actions";

export async function addPassport(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return runAuthedAction(MESSAGES.addPassportFailed, async (userId) => {
    const passport = parseInput(passportInputSchema, input, MESSAGES.invalidPassport);
    if (!passport.ok) return passport;
    const row = await insertPassport(userId, passport.data);
    if (!row) return { ok: false, error: MESSAGES.passportAlreadyAdded };
    return { ok: true, data: { id: row.id } };
  });
}

export async function editPassportExpiry(id: unknown, input: unknown): Promise<ActionResult> {
  return runAuthedAction(MESSAGES.savePassportFailed, async (userId) => {
    const passportId = parseInput(idSchema, id, MESSAGES.passportNotFound);
    if (!passportId.ok) return passportId;
    const expiry = parseInput(passportExpirySchema, input, MESSAGES.invalidPassport);
    if (!expiry.ok) return expiry;
    const updated = await updatePassportExpiry(userId, passportId.data, expiry.data.expires_on);
    if (!updated) return { ok: false, error: MESSAGES.passportNotFound };
    return { ok: true, data: undefined };
  });
}

export async function removePassport(id: unknown): Promise<ActionResult> {
  return runAuthedAction(MESSAGES.removePassportFailed, async (userId) => {
    const passportId = parseInput(idSchema, id, MESSAGES.passportNotFound);
    if (!passportId.ok) return passportId;
    const deleted = await deletePassport(userId, passportId.data);
    if (!deleted) return { ok: false, error: MESSAGES.passportNotFound };
    return { ok: true, data: undefined };
  });
}
