import { defineVisaRule, officialSource } from "@/lib/rules/define";
import type { VisaRule } from "@/types/rules";

const RETRIEVED_AT = "2026-10-08";

const exemptionSource = officialSource(
  "https://mofa.gov.vn/tin-chi-tiet/chi-tiet/viet-nam-39-s-visa-exemption-list-57163-596.html",
  RETRIEVED_AT,
  "Ministry of Foreign Affairs table dated 30 Jun 2025; later resolutions may add countries.",
);

const shared = { destination: "VN", source: exemptionSource };

export const vietnamVisaRules: VisaRule[] = [
  defineVisaRule({
    ...shared,
    id: "vn-exemption-45",
    passports: ["DE", "FR", "IT", "ES", "GB", "RU", "JP", "KR", "DK", "SE", "NO", "FI"],
    allowedDays: 45,
    validFrom: "2025-03-15",
    validUntil: "2028-03-14",
  }),
  defineVisaRule({
    ...shared,
    id: "vn-exemption-30",
    passports: ["KH", "ID", "LA", "MY", "MN", "MM", "SG", "TH", "KG"],
    allowedDays: 30,
  }),
  defineVisaRule({
    ...shared,
    id: "vn-exemption-30-by",
    passports: ["BY"],
    allowedDays: 30,
    source: officialSource(
      exemptionSource.url,
      RETRIEVED_AT,
      "Also capped at 90 days per calendar year; the cap is not tracked yet.",
    ),
  }),
  defineVisaRule({
    ...shared,
    id: "vn-exemption-30-kz",
    passports: ["KZ"],
    allowedDays: 30,
    source: officialSource(
      exemptionSource.url,
      RETRIEVED_AT,
      "Also capped at 90 days within any 180 days; the cap is not tracked yet.",
    ),
  }),
  defineVisaRule({ ...shared, id: "vn-exemption-21", passports: ["PH"], allowedDays: 21 }),
  defineVisaRule({ ...shared, id: "vn-exemption-14", passports: ["BN"], allowedDays: 14 }),
  defineVisaRule({ ...shared, id: "vn-exemption-90", passports: ["CL", "PA"], allowedDays: 90 }),
];
