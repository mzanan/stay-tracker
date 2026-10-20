"use server";

import { runAuthedAction } from "@/lib/actionRunner";
import { MESSAGES } from "@/lib/constants/messages";
import { deleteStay, insertStay, updateStay, type StayWriteResult } from "@/lib/data/stays";
import { idSchema, isoDateSchema } from "@/lib/schemas/common";
import { stayInputSchema } from "@/lib/schemas/stays";
import { stayConflictMessage } from "@/lib/stays";
import { parseInput } from "@/lib/validation";
import type { ActionResult } from "@/types/actions";

function toActionResult(result: StayWriteResult): ActionResult<{ id: string }> {
  if (result.kind === "ok") return { ok: true, data: { id: result.id } };
  if (result.kind === "conflict") return { ok: false, error: stayConflictMessage(result.conflict) };
  return { ok: false, error: MESSAGES.stayNotFound };
}

export async function createStay(
  input: unknown,
  today: unknown,
): Promise<ActionResult<{ id: string }>> {
  return runAuthedAction(MESSAGES.saveStayFailed, async (userId) => {
    const stay = parseInput(stayInputSchema, input, MESSAGES.invalidStay);
    if (!stay.ok) return stay;
    const day = parseInput(isoDateSchema, today, MESSAGES.invalidDate);
    if (!day.ok) return day;
    return toActionResult(await insertStay(userId, stay.data, day.data));
  });
}

export async function editStay(
  id: unknown,
  input: unknown,
  today: unknown,
): Promise<ActionResult<{ id: string }>> {
  return runAuthedAction(MESSAGES.saveStayFailed, async (userId) => {
    const stayId = parseInput(idSchema, id, MESSAGES.stayNotFound);
    if (!stayId.ok) return stayId;
    const stay = parseInput(stayInputSchema, input, MESSAGES.invalidStay);
    if (!stay.ok) return stay;
    const day = parseInput(isoDateSchema, today, MESSAGES.invalidDate);
    if (!day.ok) return day;
    return toActionResult(await updateStay(userId, stayId.data, stay.data, day.data));
  });
}

export async function removeStay(id: unknown): Promise<ActionResult> {
  return runAuthedAction(MESSAGES.removeStayFailed, async (userId) => {
    const stayId = parseInput(idSchema, id, MESSAGES.stayNotFound);
    if (!stayId.ok) return stayId;
    const deleted = await deleteStay(userId, stayId.data);
    if (!deleted) return { ok: false, error: MESSAGES.stayNotFound };
    return { ok: true, data: undefined };
  });
}
