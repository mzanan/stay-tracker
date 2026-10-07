"use server";

import { runAuthedAction } from "@/lib/actionRunner";
import { MESSAGES } from "@/lib/constants/messages";
import { deleteStay, insertStay, updateStay, type StayWriteResult } from "@/lib/data/stays";
import { idSchema } from "@/lib/schemas/common";
import { stayInputSchema } from "@/lib/schemas/stays";
import type { StayConflict } from "@/lib/stays";
import { parseInput } from "@/lib/validation";
import type { ActionResult } from "@/types/actions";

function conflictMessage(conflict: StayConflict): string {
  if (conflict.kind === "passportNotFound") return MESSAGES.passportNotFound;
  if (conflict.kind === "overlap") return MESSAGES.overlap(conflict.entryDate);
  return MESSAGES.splitStay(conflict.date);
}

function toActionResult(result: StayWriteResult): ActionResult<{ id: string }> {
  if (result.kind === "ok") return { ok: true, data: { id: result.id } };
  if (result.kind === "conflict") return { ok: false, error: conflictMessage(result.conflict) };
  return { ok: false, error: MESSAGES.stayNotFound };
}

export async function createStay(input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAuthedAction(MESSAGES.saveStayFailed, async (userId) => {
    const stay = parseInput(stayInputSchema, input, MESSAGES.invalidStay);
    if (!stay.ok) return stay;
    return toActionResult(await insertStay(userId, stay.data));
  });
}

export async function editStay(
  id: unknown,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return runAuthedAction(MESSAGES.saveStayFailed, async (userId) => {
    const stayId = parseInput(idSchema, id, MESSAGES.stayNotFound);
    if (!stayId.ok) return stayId;
    const stay = parseInput(stayInputSchema, input, MESSAGES.invalidStay);
    if (!stay.ok) return stay;
    return toActionResult(await updateStay(userId, stayId.data, stay.data));
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
