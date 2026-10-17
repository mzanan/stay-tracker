import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { addDays, eachDay } from "@/lib/dates";
import {
  lastExit,
  manualVisaHolder,
  SCHENGEN_ALLOWED,
  SCHENGEN_PERIOD,
  schengenRule,
  schengenZones,
  staysArbitrary,
} from "@/test/schengenFixtures";
import { areaOf, destinationsFor, maxStayDays, rollingUsage, visaStatus } from "@/lib/rules/visa";
import type { StayDates } from "@/types/rules";

function presentDays(stays: StayDates[]): Set<string> {
  return new Set(stays.flatMap((stay) => eachDay(stay.entry_date, stay.exit_date ?? stay.entry_date)));
}

function oracleMaxStay(stays: StayDates[], entryDate: string): number {
  const present = presentDays(stays);
  let length = 0;
  while (length < SCHENGEN_PERIOD) {
    const day = addDays(entryDate, length);
    present.add(day);
    let used = 0;
    for (let back = 0; back < SCHENGEN_PERIOD; back++) {
      if (present.has(addDays(day, -back))) used++;
    }
    if (used > SCHENGEN_ALLOWED) break;
    length++;
  }
  return length;
}

describe("Schengen 90/180 golden cases from the official calculator manual", () => {
  it.each([
    ["2024-06-19", 20],
    ["2024-08-07", 20],
    ["2024-08-08", 50],
    ["2024-09-08", 90],
  ])("planning entry on %s allows %i days", (entryDate, expected) => {
    expect(maxStayDays(manualVisaHolder, schengenRule, schengenZones, entryDate)).toBe(expected);
  });
});

describe("Schengen membership dates", () => {
  const area = areaOf(schengenRule.destination, schengenZones);

  it("has the 29 current members", () => {
    expect(area.size).toBe(29);
  });

  it.each([
    ["HR", "2022-12-01", "2023-01-10", 10],
    ["BG", "2024-03-01", "2024-04-09", 10],
    ["RO", "2024-03-30", "2024-03-31", 1],
    ["FR", "2024-03-01", "2024-03-10", 10],
  ])("counts %s days only from the day it applies the rule", (country, entry, exit, expected) => {
    const stays: StayDates[] = [{ country, entry_date: entry, exit_date: exit }];
    expect(rollingUsage(stays, area, SCHENGEN_PERIOD, exit)).toBe(expected);
  });

  it.each([
    [
      "a stay that starts before the country joined",
      [{ country: "BG", entry_date: "2024-01-01", exit_date: "2024-06-01" }],
      "2024-04-10",
      { entryDate: "2024-03-31", daysUsed: 11, mustLeaveBy: "2024-06-28", overstayed: false },
    ],
    [
      "an open stay that spans the join date",
      [{ country: "HR", entry_date: "2022-12-01", exit_date: null }],
      "2023-01-05",
      { entryDate: "2023-01-01", daysUsed: 5, mustLeaveBy: "2023-03-31", overstayed: false },
    ],
    [
      "a move from a country that had not joined yet",
      [
        { country: "HR", entry_date: "2022-12-01", exit_date: "2022-12-31" },
        { country: "SI", entry_date: "2022-12-31", exit_date: null },
      ],
      "2023-01-10",
      { entryDate: "2022-12-31", daysUsed: 11, mustLeaveBy: "2023-03-30", overstayed: false },
    ],
    [
      "a stay in a country that had not joined yet between two zone stays",
      [
        { country: "SI", entry_date: "2022-10-01", exit_date: "2022-10-31" },
        { country: "HR", entry_date: "2022-10-31", exit_date: "2022-11-30" },
        { country: "SI", entry_date: "2022-11-30", exit_date: null },
      ],
      "2022-12-10",
      { entryDate: "2022-11-30", daysUsed: 42, mustLeaveBy: "2023-01-27", overstayed: false },
    ],
  ])("reports %s from the membership date", (_, stays, today, expected) => {
    expect(visaStatus(stays as StayDates[], schengenRule, schengenZones, today)).toMatchObject(expected);
  });

  it("does not apply the Schengen rule before a country joined", () => {
    expect(destinationsFor("HR", schengenZones, "2022-12-31")).toEqual(["HR"]);
    expect(destinationsFor("HR", schengenZones, "2023-01-01")).toEqual(["HR", "SCHENGEN"]);
  });
});

describe("Schengen 90/180 properties", () => {
  it("matches a naive day-by-day oracle for any history", () => {
    fc.assert(
      fc.property(staysArbitrary(60), fc.integer({ min: 1, max: 120 }), (stays, gap) => {
        const entryDate = addDays(lastExit(stays), gap);
        expect(maxStayDays(stays, schengenRule, schengenZones, entryDate)).toBe(
          oracleMaxStay(stays, entryDate),
        );
      }),
    );
  });

  it("restores the full 90 days after 90 consecutive days outside", () => {
    fc.assert(
      fc.property(staysArbitrary(60), fc.integer({ min: 0, max: 60 }), (stays, extra) => {
        const entryDate = addDays(lastExit(stays), SCHENGEN_ALLOWED + 1 + extra);
        expect(maxStayDays(stays, schengenRule, schengenZones, entryDate)).toBe(SCHENGEN_ALLOWED);
      }),
    );
  });
});
