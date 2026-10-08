import { officialSource } from "@/lib/rules/define";
import type { TaxRule } from "@/types/rules";

const RETRIEVED_AT = "2026-10-08";

export const malaysiaTaxRule: TaxRule = {
  country: "MY",
  thresholdDays: 182,
  period: { kind: "calendarYear" },
  dayCounting: "inclusive",
  source: officialSource(
    "https://www.hasil.gov.my/en/individu/taraf-mastautin/",
    RETRIEVED_AT,
    "Income Tax Act 1967 s.7: 182 days or more in the basis year; day counting is not stated.",
  ),
};
