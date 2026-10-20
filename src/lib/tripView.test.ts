import { describe, expect, it } from "vitest";

import { SCHENGEN_RULE, SCHENGEN_ZONES } from "@/lib/rules/schengen";
import { buildTripView, reentryHorizonEnd, tripOverstays } from "@/lib/tripView";
import type { StayDates } from "@/types/rules";

const TODAY = "2026-10-18";

function stay(country: string, entry_date: string, exit_date: string | null): StayDates {
  return { country, entry_date, exit_date };
}

function view(stays: StayDates[], passportCountries = ["AR"]) {
  return buildTripView({
    rule: SCHENGEN_RULE,
    zones: SCHENGEN_ZONES,
    passportCountries,
    stays,
    today: TODAY,
  });
}

function steps(calendar: { entryDate: string; maxStayDays: number }[]) {
  return calendar
    .filter((day, index) => index === 0 || calendar[index - 1].maxStayDays !== day.maxStayDays)
    .map(({ entryDate, maxStayDays }) => ({ entryDate, maxStayDays }));
}

describe("buildTripView", () => {
  it("shows no limit when any passport is exempt", () => {
    expect(view([stay("ES", "2026-10-01", null)], ["AR", "IT"])).toEqual({
      kind: "exempt",
      passportCountry: "IT",
    });
  });

  it("gives the last legal day inside, counting old days that leave the window", () => {
    const result = view([
      stay("ES", "2026-05-01", "2026-05-20"),
      stay("FR", "2026-06-10", "2026-06-25"),
      stay("ES", "2026-10-01", null),
    ]);
    expect(result).toEqual({
      kind: "inside",
      areaEntryDate: "2026-10-01",
      daysUsed: 54,
      lastDay: "2026-12-29",
      daysLeftAfterToday: 72,
    });
  });

  it("reports the overstay and the full-stay date if leaving today", () => {
    const result = view([stay("ES", "2026-04-22", "2026-07-07"), stay("FR", "2026-10-01", null)]);
    expect(result).toEqual({
      kind: "overstay",
      areaEntryDate: "2026-10-01",
      daysUsed: 95,
      overSince: "2026-10-14",
      daysOver: 5,
      fullStayIfLeavingToday: "2027-01-17",
    });
  });

  it("builds the re-entry calendar in steps up to the full stay", () => {
    const result = view([
      stay("ES", "2026-05-01", "2026-05-20"),
      stay("FR", "2026-06-10", "2026-06-25"),
      stay("IT", "2026-07-15", "2026-08-10"),
      stay("DE", "2026-09-15", "2026-10-10"),
    ]);
    if (result.kind !== "outside") throw new Error(`expected outside, got ${result.kind}`);
    expect(result.daysUsed).toBe(89);
    expect(steps(result.calendar)).toEqual([
      { entryDate: "2026-10-18", maxStayDays: 1 },
      { entryDate: "2026-10-27", maxStayDays: 21 },
      { entryDate: "2026-11-16", maxStayDays: 37 },
      { entryDate: "2026-12-05", maxStayDays: 64 },
      { entryDate: "2027-01-09", maxStayDays: 90 },
    ]);
    expect(result.calendar.at(-1)?.entryDate).toBe("2027-01-31");
  });

  it("marks calendar days already covered by a planned trip as booked", () => {
    const result = view([stay("ES", "2026-10-20", "2026-10-25")]);
    if (result.kind !== "outside") throw new Error(`expected outside, got ${result.kind}`);
    const booked = result.calendar.filter((day) => day.booked).map((day) => day.entryDate);
    expect(booked).toEqual([
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
      "2026-10-25",
    ]);
  });

  it("ignores stays outside the Schengen area", () => {
    const result = view([stay("IE", "2026-09-01", null)]);
    if (result.kind !== "outside") throw new Error(`expected outside, got ${result.kind}`);
    expect(result.daysUsed).toBe(0);
    expect(result.calendar.every((day) => day.maxStayDays === 90)).toBe(true);
  });
});

describe("reentryHorizonEnd", () => {
  it("ends the month of today when there are no trips", () => {
    expect(reentryHorizonEnd([], SCHENGEN_RULE, SCHENGEN_ZONES, TODAY)).toBe("2026-10-31");
  });

  it("reaches past a planned trip until the allowance settles", () => {
    const planned = [stay("ES", "2027-02-01", "2027-02-10")];
    expect(reentryHorizonEnd(planned, SCHENGEN_RULE, SCHENGEN_ZONES, TODAY)).toBe("2027-05-31");
  });
});

describe("tripOverstays", () => {
  function overstays(stays: StayDates[], passportCountries = ["AR"]) {
    return tripOverstays({
      rule: SCHENGEN_RULE,
      zones: SCHENGEN_ZONES,
      passportCountries,
      stays,
      today: TODAY,
    });
  }

  it("flags a planned trip that goes over the limit", () => {
    const planned = stay("ES", "2026-11-01", "2027-02-05");
    expect(overstays([planned])).toEqual([
      { areaEntryDate: "2026-11-01", lastLegalDay: "2027-01-29", daysOver: 7, staysOver: [planned] },
    ]);
  });

  it("flags the current stay when its planned exit is past the last legal day", () => {
    const current = stay("ES", "2026-10-01", "2027-01-10");
    expect(overstays([current])).toEqual([
      { areaEntryDate: "2026-10-01", lastLegalDay: "2026-12-29", daysOver: 12, staysOver: [current] },
    ]);
  });

  it("flags only the stays of a past visit that end after the last legal day", () => {
    const spain = stay("ES", "2026-01-01", "2026-02-15");
    const france = stay("FR", "2026-02-15", "2026-04-10");
    expect(overstays([spain, france])).toEqual([
      { areaEntryDate: "2026-01-01", lastLegalDay: "2026-03-31", daysOver: 10, staysOver: [france] },
    ]);
  });

  it("returns nothing for trips within the limit, open stays and exempt passports", () => {
    expect(overstays([stay("ES", "2026-11-01", "2027-01-29")])).toEqual([]);
    expect(overstays([stay("ES", "2026-04-01", null)])).toEqual([]);
    expect(overstays([stay("ES", "2026-11-01", "2027-02-05")], ["AR", "IT"])).toEqual([]);
  });
});
