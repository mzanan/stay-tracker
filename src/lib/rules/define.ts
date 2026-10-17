import type { z } from "zod";

import { ruleSourceSchema, visaRuleSchema } from "@/lib/schemas/rules";
import type { RuleSource, VisaRule } from "@/types/rules";

export function defineVisaRule(input: z.input<typeof visaRuleSchema>): VisaRule {
  return visaRuleSchema.parse(input);
}

export function communitySource(url: string, retrievedAt: string, note: string): RuleSource {
  return ruleSourceSchema.parse({ url, official: false, retrievedAt, verifiedAt: null, note });
}
