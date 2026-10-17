import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { addDays } from "@/lib/dates";
import { reentryOutlook, reentryTimeline } from "@/lib/rules/reentry";
import {
  lastExit,
  manualVisaHolder,
  SCHENGEN_ALLOWED,
  schengenRule,
  schengenZones,
  staysArbitrary,
} from "@/test/schengenFixtures";
import { maxStayDays } from "@/lib/rules/visa";

describe("re-entry outlook on the official manual example", () => {
  it("reports the outlook the day after leaving", () => {
    expect(reentryOutlook(manualVisaHolder, schengenRule, schengenZones, "2024-06-19")).toEqual({
      daysUsed: 80,
      daysLeftIfEnteringToday: 20,
      earliestEntry: "2024-06-19",
      fullStayFrom: "2024-09-08",
    });
  });

  it("does not offer re-entry on the exit day when 90 days are used", () => {
    const stays = [{ country: "FR", entry_date: "2026-07-20", exit_date: "2026-10-17" }];
    expect(reentryOutlook(stays, schengenRule, schengenZones, "2026-10-17")).toEqual({
      daysUsed: 90,
      daysLeftIfEnteringToday: 0,
      earliestEntry: "2027-01-16",
      fullStayFrom: "2027-01-16",
    });
  });

  it("offers no entry while an open stay keeps the traveller inside", () => {
    const stays = [{ country: "FR", entry_date: "2026-09-01", exit_date: null }];
    const outlook = reentryOutlook(stays, schengenRule, schengenZones, "2026-10-17");
    expect(outlook.daysLeftIfEnteringToday).toBe(0);
    expect(outlook.earliestEntry).toBeNull();
    expect(outlook.fullStayFrom).toBeNull();
  });

  it("lists how long each entry date allows", () => {
    expect(reentryTimeline(manualVisaHolder, schengenRule, schengenZones, "2024-08-07", 2)).toEqual([
      { entryDate: "2024-08-07", maxStayDays: 20 },
      { entryDate: "2024-08-08", maxStayDays: 50 },
    ]);
  });
});

describe("re-entry outlook properties", () => {
  it("earliest entry is the first date with at least one allowed day", () => {
    fc.assert(
      fc.property(staysArbitrary(120), fc.integer({ min: 1, max: 30 }), (stays, gap) => {
        const today = addDays(lastExit(stays), gap);
        const { earliestEntry } = reentryOutlook(stays, schengenRule, schengenZones, today);
        expect(earliestEntry).not.toBeNull();
        const entry = earliestEntry as string;
        expect(maxStayDays(stays, schengenRule, schengenZones, entry)).toBeGreaterThan(0);
        if (entry > today) {
          expect(maxStayDays(stays, schengenRule, schengenZones, addDays(entry, -1))).toBe(0);
        }
      }),
    );
  });

  it("full stay date is the first date allowing the whole 90 days", () => {
    fc.assert(
      fc.property(staysArbitrary(120), fc.integer({ min: 1, max: 30 }), (stays, gap) => {
        const today = addDays(lastExit(stays), gap);
        const { fullStayFrom } = reentryOutlook(stays, schengenRule, schengenZones, today);
        expect(fullStayFrom).not.toBeNull();
        const entry = fullStayFrom as string;
        expect(maxStayDays(stays, schengenRule, schengenZones, entry)).toBe(SCHENGEN_ALLOWED);
        if (entry > today) {
          expect(maxStayDays(stays, schengenRule, schengenZones, addDays(entry, -1))).toBeLessThan(
            SCHENGEN_ALLOWED,
          );
        }
        expect(entry <= addDays(lastExit(stays), SCHENGEN_ALLOWED + 1)).toBe(true);
      }),
    );
  });
});
