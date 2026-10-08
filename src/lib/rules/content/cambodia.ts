import { defineVisaRule, officialSource } from "@/lib/rules/define";
import type { VisaRule } from "@/types/rules";

const RETRIEVED_AT = "2026-10-08";

const exemptionSource = officialSource(
  "https://www.cambodiaembassyuk.org/visa-exemption/",
  RETRIEVED_AT,
  "Royal Embassy of Cambodia in London table as of 28 Feb 2025, ordinary passports.",
);

const shared = { destination: "KH", source: exemptionSource };

export const cambodiaVisaRules: VisaRule[] = [
  defineVisaRule({
    ...shared,
    id: "kh-exemption-30",
    passports: ["ID", "LA", "MY", "PH", "SG", "VN", "MV"],
    allowedDays: 30,
  }),
  defineVisaRule({ ...shared, id: "kh-exemption-15", passports: ["SC"], allowedDays: 15 }),
  defineVisaRule({
    ...shared,
    id: "kh-exemption-14",
    passports: ["BN", "MM", "TH"],
    allowedDays: 14,
  }),
];
