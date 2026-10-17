import type { RuleSource, VisaRule } from "@/types/rules";

type VisaRuleInput = Pick<VisaRule, "id" | "destination" | "passports" | "allowedDays" | "source"> &
  Partial<Omit<VisaRule, "id" | "destination" | "passports" | "allowedDays" | "source">>;

export function defineVisaRule(input: VisaRuleInput): VisaRule {
  return {
    exemptPassports: [],
    window: { kind: "perEntry" },
    extensionDays: null,
    reportingIntervalDays: null,
    validFrom: null,
    validUntil: null,
    ...input,
  };
}

export function communitySource(url: string, retrievedAt: string, note: string): RuleSource {
  return { url, official: false, retrievedAt, verifiedAt: null, underReview: false, note };
}
