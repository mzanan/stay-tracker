import type { Stay } from "@/types/db";

export type DayCounting = "inclusive" | "midnight";

export interface RuleSource {
  url: string;
  official: boolean;
  verifiedAt: string | null;
}

export type VisaWindow =
  | { kind: "perEntry" }
  | { kind: "rolling"; periodDays: number };

export interface VisaRule {
  id: string;
  destination: string;
  passports: string[] | "all";
  allowedDays: number;
  window: VisaWindow;
  extensionDays: number | null;
  reportingIntervalDays: number | null;
  source: RuleSource;
}

export interface Zone {
  id: string;
  name: string;
  members: string[];
}

export type TaxPeriod =
  | { kind: "calendarYear" }
  | { kind: "taxYear"; startMonth: number; startDay: number }
  | { kind: "rolling"; periodDays: number };

export interface TaxRule {
  country: string;
  thresholdDays: number;
  period: TaxPeriod;
  dayCounting: DayCounting;
  source: RuleSource;
}

export type StayDates = Pick<Stay, "country" | "entry_date" | "exit_date">;
