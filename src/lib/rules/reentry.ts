import { addDays, daysBetween, laterDate } from "@/lib/dates";
import { stayCoveringDay } from "@/lib/rules/presence";
import { areaOf, inForce, maxStayDays, rollingUsage } from "@/lib/rules/visa";
import type { StayDates, VisaRule, Zone } from "@/types/rules";

export interface EntryOption {
  entryDate: string;
  maxStayDays: number;
}

export interface ReentryOutlook {
  daysUsed: number;
  daysLeftIfEnteringToday: number;
  earliestEntry: string | null;
  fullStayFrom: string | null;
}

function lastSearchDate(
  stays: StayDates[],
  rule: VisaRule,
  zones: Zone[],
  today: string,
): string {
  const area = areaOf(rule.destination, zones);
  const areaStays = stays.filter((stay) => area.has(stay.country));
  if (areaStays.length === 0 || areaStays.some((stay) => stay.exit_date === null)) return today;
  const lastExit = areaStays.map((stay) => stay.exit_date as string).sort().at(-1) as string;
  const daysOutForFullStay =
    rule.window.kind === "rolling" ? rule.window.periodDays - rule.allowedDays + 1 : 1;
  return laterDate(today, addDays(lastExit, daysOutForFullStay));
}

function allowedStayFrom(
  stays: StayDates[],
  rule: VisaRule,
  zones: Zone[],
  entryDate: string,
): number {
  if (!inForce(rule, entryDate)) return 0;
  if (stayCoveringDay(stays, areaOf(rule.destination, zones), entryDate)) return 0;
  return maxStayDays(stays, rule, zones, entryDate);
}

export function reentryTimeline(
  stays: StayDates[],
  rule: VisaRule,
  zones: Zone[],
  from: string,
  days: number,
): EntryOption[] {
  return Array.from({ length: days }, (_, offset) => {
    const entryDate = addDays(from, offset);
    return { entryDate, maxStayDays: allowedStayFrom(stays, rule, zones, entryDate) };
  });
}

export function reentryOutlook(
  stays: StayDates[],
  rule: VisaRule,
  zones: Zone[],
  today: string,
): ReentryOutlook {
  const daysUsed =
    rule.window.kind === "rolling"
      ? rollingUsage(stays, areaOf(rule.destination, zones), rule.window.periodDays, today)
      : 0;
  const outlook: ReentryOutlook = {
    daysUsed,
    daysLeftIfEnteringToday: allowedStayFrom(stays, rule, zones, today),
    earliestEntry: null,
    fullStayFrom: null,
  };

  const searchDays = daysBetween(today, lastSearchDate(stays, rule, zones, today)) + 1;
  for (let offset = 0; offset < searchDays; offset++) {
    const entryDate = addDays(today, offset);
    const days = offset === 0 ? outlook.daysLeftIfEnteringToday : allowedStayFrom(stays, rule, zones, entryDate);
    if (outlook.earliestEntry === null && days > 0) outlook.earliestEntry = entryDate;
    if (days >= rule.allowedDays) {
      outlook.fullStayFrom = entryDate;
      break;
    }
  }
  return outlook;
}
