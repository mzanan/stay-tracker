import { describe, expect, it } from "vitest";

import { OFFICIAL_TAX_RULES, OFFICIAL_VISA_RULES, OFFICIAL_ZONES } from "@/lib/rules/content";
import { validateRuleSet } from "@/lib/rules/validate";
import { findVisaRule } from "@/lib/rules/visa";

describe("official rule set", () => {
  it("passes every schema and semantic check", () => {
    expect(validateRuleSet(OFFICIAL_VISA_RULES, OFFICIAL_TAX_RULES, OFFICIAL_ZONES)).toEqual([]);
  });
});

describe("overlapping rules", () => {
  const base = OFFICIAL_VISA_RULES.find((rule) => rule.id === "th-exemption-30");
  if (!base) throw new Error("Missing th-exemption-30");
  const generous = { ...base, id: "th-generous", passports: ["US"], allowedDays: 60 };
  const strict = { ...base, id: "th-strict", passports: ["US", "CA"], allowedDays: 30 };

  it("fails the rule set", () => {
    expect(validateRuleSet([generous, strict], [], [])).toContain(
      "visa rules th-generous and th-strict: overlap for US",
    );
  });

  it("resolves at runtime to the most conservative rule", () => {
    expect(findVisaRule([generous, strict], [], "TH", "US", "2026-10-17")?.id).toBe("th-strict");
  });
});
