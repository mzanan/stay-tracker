import { defineVisaRule, officialSource } from "@/lib/rules/define";
import type { TaxRule, VisaRule } from "@/types/rules";

const RETRIEVED_AT = "2026-10-08";
const ROLLING_PERIOD_DAYS = 365;

export const indonesiaVisaRules: VisaRule[] = [
  defineVisaRule({
    id: "id-exemption-30",
    destination: "ID",
    passports: [
      "BN", "MY", "TH", "VN", "PH", "KH", "SG", "MM", "LA", "TL",
      "SR", "CO", "HK", "TR", "BR", "PE", "KZ", "MO", "BY",
    ],
    allowedDays: 30,
    source: officialSource(
      "https://www.imigrasi.go.id/wna/daftar-negara-voa-bvk-calling-visa/daftar-negara-bebas-visa-kunjungan",
      RETRIEVED_AT,
      "List from the Directorate General of Immigration; the 30-day, non-extendable stay is stated in the Brazil and Turkey notice only.",
    ),
  }),
];

export const indonesiaTaxRule: TaxRule = {
  country: "ID",
  thresholdDays: 184,
  period: { kind: "rolling", periodDays: ROLLING_PERIOD_DAYS },
  dayCounting: "inclusive",
  source: officialSource(
    "https://pajak.go.id/en/node/118835",
    RETRIEVED_AT,
    "PER-23/PJ/2025: more than 183 days within 12 months; part of a day counts as a full day.",
  ),
};
