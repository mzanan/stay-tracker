import { cn } from "cn";

import { DAY_TIER_CLASSES } from "@/components/Tracker/dayTierClasses";
import type { CalendarCell } from "@/lib/calendarGrid";
import { dayTier } from "@/lib/dayScale";
import { formatDay, formatDays } from "@/lib/formatDate";
import { SCHENGEN_RULE } from "@/lib/rules/schengen";

interface CalendarDayProps {
  cell: CalendarCell;
  today: string;
  selected: boolean;
  tabbable: boolean;
  onSelect: (iso: string) => void;
}

export function CalendarDay({ cell, today, selected, tabbable, onSelect }: CalendarDayProps) {
  if (!cell.option) {
    return (
      <span className="flex aspect-square items-center justify-center text-xs text-muted-foreground/50" aria-hidden="true">
        {cell.day}
      </span>
    );
  }
  const { booked, maxStayDays } = cell.option;
  const status = booked ? "trip planned" : maxStayDays === 0 ? "cannot enter" : formatDays(maxStayDays);
  return (
    <button
      type="button"
      data-iso={cell.iso}
      tabIndex={tabbable ? 0 : -1}
      aria-pressed={selected}
      aria-label={`${formatDay(cell.iso, today)}: ${status}`}
      onClick={() => onSelect(cell.iso)}
      className={cn(
        "flex aspect-square flex-col items-center justify-center rounded-lg leading-none outline-offset-2 transition-shadow focus-visible:outline-3 focus-visible:outline-ring",
        DAY_TIER_CLASSES[dayTier(maxStayDays, SCHENGEN_RULE.allowedDays)].cell,
        selected && "outline-3 outline-foreground",
      )}
    >
      <span className="text-sm font-semibold">{cell.day}</span>
      <span className="mt-0.5 text-2xs font-medium opacity-90">{booked ? "trip" : `${maxStayDays}d`}</span>
    </button>
  );
}
