import { addDays, earlierDate, eachDay, laterDate } from "@/lib/dates";
import { coversDay } from "@/lib/stays";
import type { DateRange } from "@/types/dates";
import type { Area, DayCounting, StayDates } from "@/types/rules";

const ALWAYS_MEMBER = "0000-01-01";

export function countryArea(country: string): Area {
  return new Map([[country, ALWAYS_MEMBER]]);
}

export function inAreaOn(area: Area, country: string, day: string): boolean {
  const memberFrom = area.get(country);
  return memberFrom !== undefined && day >= memberFrom;
}

function presenceRange(
  stay: StayDates,
  today: string,
  counting: DayCounting,
): DateRange | null {
  const exit = stay.exit_date ?? today;
  const lastDay = counting === "midnight" && stay.exit_date ? addDays(exit, -1) : exit;
  if (lastDay < stay.entry_date) return null;
  return { start: stay.entry_date, end: lastDay };
}

export function presenceDays(
  stays: StayDates[],
  area: Area,
  window: DateRange,
  today: string,
  counting: DayCounting = "inclusive",
): Set<string> {
  const days = new Set<string>();
  for (const stay of stays) {
    const memberFrom = area.get(stay.country);
    if (memberFrom === undefined) continue;
    const range = presenceRange(stay, today, counting);
    if (!range) continue;
    const start = laterDate(laterDate(range.start, window.start), memberFrom);
    const end = earlierDate(range.end, window.end);
    if (start > end) continue;
    for (const day of eachDay(start, end)) days.add(day);
  }
  return days;
}

export function stayCoveringDay(
  stays: StayDates[],
  area: Area,
  day: string,
): StayDates | null {
  const covering = stays.filter(
    (stay) => inAreaOn(area, stay.country, day) && coversDay(stay, day),
  );
  return covering.sort((a, b) => b.entry_date.localeCompare(a.entry_date))[0] ?? null;
}

function leftAreaBetween(
  stays: StayDates[],
  area: Area,
  from: string,
  to: string,
): boolean {
  return stays.some(
    (stay) =>
      !inAreaOn(area, stay.country, laterDate(stay.entry_date, from)) &&
      stay.entry_date <= to &&
      (stay.exit_date === null || stay.exit_date >= from),
  );
}

function continuesInto(previous: StayDates, next: StayDates): boolean {
  if (previous.exit_date === next.entry_date) return true;
  return (
    previous.country !== next.country &&
    previous.exit_date === addDays(next.entry_date, -1)
  );
}

export function areaEntryDate(
  stays: StayDates[],
  area: Area,
  current: StayDates,
): string {
  let stay = current;
  for (;;) {
    const entry = stay.entry_date;
    const memberFrom = area.get(stay.country);
    if (memberFrom !== undefined && entry < memberFrom) return memberFrom;
    const previous = stays
      .filter(
        (candidate) =>
          candidate !== stay &&
          candidate.exit_date !== null &&
          inAreaOn(area, candidate.country, candidate.exit_date) &&
          candidate.entry_date < entry &&
          continuesInto(candidate, stay),
      )
      .sort((a, b) => (b.exit_date ?? "").localeCompare(a.exit_date ?? ""))[0];
    if (!previous?.exit_date) return entry;
    if (leftAreaBetween(stays, area, previous.exit_date, entry)) return entry;
    stay = previous;
  }
}
