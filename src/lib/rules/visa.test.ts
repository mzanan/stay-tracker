import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { addDays, daysBetween, eachDay } from "@/lib/dates";
import { schengenVisaRules, schengenZone } from "@/lib/rules/content/schengen";
import { latestExitIfStaying } from "@/lib/rules/visa";
import type { StayDates } from "@/types/rules";

const rule = schengenVisaRules[0];
const zones = [schengenZone];
const ALLOWED = 90;
const PERIOD = 180;

function maxStayDays(stays: StayDates[], entryDate: string): number {
  return daysBetween(entryDate, latestExitIfStaying(stays, rule, zones, entryDate)) + 1;
}

function presentDays(stays: StayDates[]): Set<string> {
  return new Set(stays.flatMap((stay) => eachDay(stay.entry_date, stay.exit_date ?? stay.entry_date)));
}

function oracleMaxStay(stays: StayDates[], entryDate: string): number {
  const present = presentDays(stays);
  let length = 0;
  while (length < PERIOD) {
    const day = addDays(entryDate, length);
    present.add(day);
    let used = 0;
    for (let back = 0; back < PERIOD; back++) {
      if (present.has(addDays(day, -back))) used++;
    }
    if (used > ALLOWED) break;
    length++;
  }
  return length;
}

const manualVisaHolder: StayDates[] = [
  { country: "FR", entry_date: "2024-01-01", exit_date: "2024-01-10" },
  { country: "FR", entry_date: "2024-03-01", exit_date: "2024-03-30" },
  { country: "FR", entry_date: "2024-05-01", exit_date: "2024-06-09" },
];

const BASE = "2024-01-01";

const staysArbitrary = fc
  .array(fc.record({ gap: fc.integer({ min: 1, max: 60 }), length: fc.integer({ min: 1, max: 60 }) }), {
    maxLength: 8,
  })
  .map((segments) => {
    let cursor = BASE;
    return segments.map(({ gap, length }) => {
      const entry = addDays(cursor, gap);
      const exit = addDays(entry, length - 1);
      cursor = exit;
      return { country: "FR", entry_date: entry, exit_date: exit } satisfies StayDates;
    });
  });

function lastExit(stays: StayDates[]): string {
  return stays.at(-1)?.exit_date ?? BASE;
}

describe("Schengen 90/180 golden cases from the official calculator manual", () => {
  it.each([
    ["2024-06-19", 20],
    ["2024-08-07", 20],
    ["2024-08-08", 50],
    ["2024-09-08", 90],
  ])("planning entry on %s allows %i days", (entryDate, expected) => {
    expect(maxStayDays(manualVisaHolder, entryDate)).toBe(expected);
  });
});

describe("Schengen 90/180 properties", () => {
  it("matches a naive day-by-day oracle for any history", () => {
    fc.assert(
      fc.property(staysArbitrary, fc.integer({ min: 1, max: 120 }), (stays, gap) => {
        const entryDate = addDays(lastExit(stays), gap);
        expect(maxStayDays(stays, entryDate)).toBe(oracleMaxStay(stays, entryDate));
      }),
    );
  });

  it("restores the full 90 days after 90 consecutive days outside", () => {
    fc.assert(
      fc.property(staysArbitrary, fc.integer({ min: 0, max: 60 }), (stays, extra) => {
        const entryDate = addDays(lastExit(stays), ALLOWED + 1 + extra);
        expect(maxStayDays(stays, entryDate)).toBe(ALLOWED);
      }),
    );
  });
});
