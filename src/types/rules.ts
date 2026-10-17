import type { Stay } from "@/types/db";

export type DayCounting = "inclusive" | "midnight";

export interface RuleSource {
  url: string;
  official: boolean;
  retrievedAt: string;
  verifiedAt: string | null;
  note: string | null;
}

export type VisaWindow =
  | { kind: "perEntry" }
  | { kind: "rolling"; periodDays: number };

export interface VisaRule {
  id: string;
  destination: string;
  passports: string[] | "all";
  exemptPassports: string[];
  allowedDays: number;
  window: VisaWindow;
  extensionDays: number | null;
  reportingIntervalDays: number | null;
  validFrom: string | null;
  validUntil: string | null;
  source: RuleSource;
}

export interface ZoneMember {
  country: string;
  memberFrom: string;
}

export interface Zone {
  id: string;
  name: string;
  members: ZoneMember[];
  source: RuleSource;
}

export type Area = ReadonlyMap<string, string>;

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

export type EntryRequirementKind =
  | "visaFree"
  | "visaOnArrival"
  | "eta"
  | "eVisa"
  | "visaRequired"
  | "noAdmission";

export interface EntryRequirement {
  kind: EntryRequirementKind;
  days: number | null;
  source: RuleSource;
}

export type StayDates = Pick<Stay, "country" | "entry_date" | "exit_date">;
