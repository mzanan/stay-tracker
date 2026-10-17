import fc from "fast-check";

import { addDays } from "@/lib/dates";
import { OFFICIAL_VISA_RULES, OFFICIAL_ZONES } from "@/lib/rules/content";
import type { StayDates, VisaRule, Zone } from "@/types/rules";

function schengenRuleById(id: string): VisaRule {
  const rule = OFFICIAL_VISA_RULES.find((candidate) => candidate.id === id);
  if (!rule) throw new Error(`Missing Schengen rule ${id}`);
  return rule;
}

function zoneById(id: string): Zone {
  const zone = OFFICIAL_ZONES.find((candidate) => candidate.id === id);
  if (!zone) throw new Error(`Missing zone ${id}`);
  return zone;
}

export const schengenRule = schengenRuleById("schengen-short-stay");
export const schengenZones = [zoneById("SCHENGEN")];
export const SCHENGEN_ALLOWED = 90;
export const SCHENGEN_PERIOD = 180;

export const manualVisaHolder: StayDates[] = [
  { country: "FR", entry_date: "2024-01-01", exit_date: "2024-01-10" },
  { country: "FR", entry_date: "2024-03-01", exit_date: "2024-03-30" },
  { country: "FR", entry_date: "2024-05-01", exit_date: "2024-06-09" },
];

const BASE = "2024-01-01";

export function staysArbitrary(maxStayLength: number): fc.Arbitrary<StayDates[]> {
  return fc
    .array(
      fc.record({ gap: fc.integer({ min: 1, max: 60 }), length: fc.integer({ min: 1, max: maxStayLength }) }),
      { maxLength: 8 },
    )
    .map((segments) => {
      let cursor = BASE;
      return segments.map(({ gap, length }) => {
        const entry = addDays(cursor, gap);
        const exit = addDays(entry, length - 1);
        cursor = exit;
        return { country: "FR", entry_date: entry, exit_date: exit } satisfies StayDates;
      });
    });
}

export function lastExit(stays: StayDates[]): string {
  return stays.at(-1)?.exit_date ?? BASE;
}
