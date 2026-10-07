import type { z } from "zod";

import type { ActionResult } from "@/types/actions";

function describeIssue(issue: z.core.$ZodIssue): string {
  const field = issue.path.join(".");
  return field ? `${field}: ${issue.message}` : issue.message;
}

export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
  fallback: string,
): ActionResult<z.output<S>> {
  const parsed = schema.safeParse(input);
  if (parsed.success) return { ok: true, data: parsed.data };
  const issue = parsed.error.issues[0];
  return { ok: false, error: issue ? describeIssue(issue) : fallback };
}
