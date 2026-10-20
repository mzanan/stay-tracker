import type { DayTier } from "@/lib/dayScale";

export const DAY_TIER_CLASSES: Record<DayTier, { cell: string; swatch: string }> = {
  none: { cell: "bg-day-none text-day-none-foreground", swatch: "bg-day-none" },
  under15: { cell: "bg-day-under15 text-day-under15-foreground", swatch: "bg-day-under15" },
  under30: { cell: "bg-day-under30 text-day-under30-foreground", swatch: "bg-day-under30" },
  under60: { cell: "bg-day-under60 text-day-under60-foreground", swatch: "bg-day-under60" },
  under90: { cell: "bg-day-under90 text-day-under90-foreground", swatch: "bg-day-under90" },
  full: { cell: "bg-day-full text-day-full-foreground", swatch: "bg-day-full" },
};
