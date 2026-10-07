import "server-only";

import { revalidatePath } from "next/cache";

import { MESSAGES } from "@/lib/constants/messages";
import { getUser } from "@/lib/session";
import type { ActionResult } from "@/types/actions";

export async function runAuthedAction<T>(
  failureMessage: string,
  action: (userId: string) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  let result: ActionResult<T>;
  try {
    const user = await getUser();
    if (!user) return { ok: false, error: MESSAGES.notAuthenticated };
    result = await action(user.id);
  } catch (error) {
    console.error(failureMessage, error);
    return { ok: false, error: failureMessage };
  }
  if (result.ok) revalidatePath("/", "layout");
  return result;
}
