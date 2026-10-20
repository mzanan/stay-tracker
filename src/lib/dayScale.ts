export type DayTier = "none" | "under15" | "under30" | "under60" | "under90" | "full";

const TIER_FLOORS: { tier: DayTier; minDays: number }[] = [
  { tier: "under90", minDays: 60 },
  { tier: "under60", minDays: 30 },
  { tier: "under30", minDays: 15 },
  { tier: "under15", minDays: 1 },
];

export function dayTier(days: number, allowedDays: number): DayTier {
  if (days >= allowedDays) return "full";
  return TIER_FLOORS.find((floor) => days >= floor.minDays)?.tier ?? "none";
}

export interface DayTierRange {
  tier: DayTier;
  minDays: number;
  maxDays: number;
}

export function dayTierRanges(allowedDays: number): DayTierRange[] {
  const floors = [...TIER_FLOORS].reverse();
  const partial = floors.map((floor, index) => ({
    tier: floor.tier,
    minDays: floor.minDays,
    maxDays: (floors[index + 1]?.minDays ?? allowedDays) - 1,
  }));
  return [
    { tier: "none", minDays: 0, maxDays: 0 },
    ...partial,
    { tier: "full", minDays: allowedDays, maxDays: allowedDays },
  ];
}

export function dayTierLabel(range: DayTierRange): string {
  if (range.tier === "none") return "Cannot enter";
  if (range.tier === "full") return `Full ${range.maxDays}`;
  return `${range.minDays} to ${range.maxDays}`;
}
