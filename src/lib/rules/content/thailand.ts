import { defineVisaRule, officialSource } from "@/lib/rules/define";
import type { TaxRule, VisaRule } from "@/types/rules";

const RETRIEVED_AT = "2026-10-08";
const EFFECTIVE_FROM = "2026-09-15";
const REPORT_EVERY_DAYS = 90;

const exemptionSource = officialSource(
  "https://washingtondc.thaiembassy.org/en/page/visaexempt-voajul2024",
  RETRIEVED_AT,
  "Royal Thai Embassy list effective 15 Sep 2026; MFA summary counts 54 countries for the 30-day scheme while this list shows 60.",
);

const shared = {
  destination: "TH",
  reportingIntervalDays: REPORT_EVERY_DAYS,
  validFrom: EFFECTIVE_FROM,
};

export const thailandVisaRules: VisaRule[] = [
  defineVisaRule({
    ...shared,
    id: "th-exemption-30",
    passports: [
      "AU", "AT", "BH", "BE", "BT", "BN", "BG", "CA", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
      "FJ", "GE", "DE", "GR", "HU", "IS", "IN", "ID", "IE", "IL", "IT", "JP", "JO", "KW", "KG",
      "LV", "LI", "LT", "LU", "MY", "MV", "MT", "NL", "NZ", "NO", "OM", "PH", "PL", "PT", "QA",
      "RO", "SA", "SG", "SK", "SI", "ZA", "ES", "SE", "CH", "TW", "TR", "AE", "GB", "UA", "US",
    ],
    allowedDays: 30,
    extensionDays: 30,
    source: exemptionSource,
  }),
  defineVisaRule({
    ...shared,
    id: "th-exemption-15",
    passports: ["SC", "MU"],
    allowedDays: 15,
    source: exemptionSource,
  }),
  defineVisaRule({
    ...shared,
    id: "th-bilateral-14",
    passports: ["KH", "MM"],
    allowedDays: 14,
    source: exemptionSource,
  }),
  defineVisaRule({
    ...shared,
    id: "th-bilateral-30",
    passports: ["CN", "KZ", "MO", "RU", "VN", "HK", "LA", "MN", "TL"],
    allowedDays: 30,
    source: exemptionSource,
  }),
  defineVisaRule({
    ...shared,
    id: "th-bilateral-90",
    passports: ["AR", "BR", "CL", "PE", "KR"],
    allowedDays: 90,
    source: exemptionSource,
  }),
];

export const thailandTaxRule: TaxRule = {
  country: "TH",
  thresholdDays: 180,
  period: { kind: "calendarYear" },
  dayCounting: "inclusive",
  source: officialSource(
    "https://www.rd.go.th/english/6045.html",
    RETRIEVED_AT,
    "Revenue Department page says more than 180 days; its 2025 manual says at least 180. The lower threshold is used.",
  ),
};
