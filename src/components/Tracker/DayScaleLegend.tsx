import { cn } from "cn";

import { DAY_TIER_CLASSES } from "@/components/Tracker/dayTierClasses";
import { dayTierLabel, dayTierRanges } from "@/lib/dayScale";
import { SCHENGEN_RULE } from "@/lib/rules/schengen";

export function DayScaleLegend() {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground" aria-label="Days you could stay">
      {dayTierRanges(SCHENGEN_RULE.allowedDays).map((range) => (
        <li key={range.tier} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-sm", DAY_TIER_CLASSES[range.tier].swatch)} aria-hidden="true" />
          {dayTierLabel(range)}
        </li>
      ))}
    </ul>
  );
}
