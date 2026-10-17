import type { z } from "zod";

import type {
  ruleFileSchema,
  ruleSourceSchema,
  taxRuleSchema,
  visaRuleSchema,
  zoneSchema,
} from "@/lib/rules/schema";
import type { Stay } from "@/types/db";

export type RuleSource = z.output<typeof ruleSourceSchema>;
export type VisaRule = z.output<typeof visaRuleSchema>;
export type VisaWindow = VisaRule["window"];
export type Zone = z.output<typeof zoneSchema>;
export type ZoneMember = Zone["members"][number];
export type TaxRule = z.output<typeof taxRuleSchema>;
export type TaxPeriod = TaxRule["period"];
export type DayCounting = TaxRule["dayCounting"];
export type RuleFile = z.output<typeof ruleFileSchema>;

export type Area = ReadonlyMap<string, string>;

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
