import { describe, expect, it } from "vitest";

import { endOfMonth } from "@/lib/dates";
import { dayTier } from "@/lib/dayScale";

describe("dayTier", () => {
  it.each([
    [0, "none"],
    [1, "under15"],
    [14, "under15"],
    [15, "under30"],
    [29, "under30"],
    [30, "under60"],
    [59, "under60"],
    [60, "under90"],
    [89, "under90"],
    [90, "full"],
  ] as const)("maps %i days to %s", (days, tier) => {
    expect(dayTier(days, 90)).toBe(tier);
  });
});

describe("endOfMonth", () => {
  it.each([
    ["2026-10-18", "2026-10-31"],
    ["2026-12-05", "2026-12-31"],
    ["2028-02-10", "2028-02-29"],
  ])("ends %s on %s", (date, end) => {
    expect(endOfMonth(date)).toBe(end);
  });
});
