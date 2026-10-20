import { addDays, daysBetween, earlierDate, endOfMonth, laterDate } from "@/lib/dates";
import { inAreaOn } from "@/lib/rules/area";
import { areaEntryDate, stayCoveringDay } from "@/lib/rules/presence";
import { reentryOutlook, reentryTimeline, type EntryOption } from "@/lib/rules/reentry";
import { areaOf, inForce, isExempt, latestExitIfStaying, visaStatus } from "@/lib/rules/visa";
import { latestPlannableDay } from "@/lib/stays";
import type { Area, StayDates, VisaRule, Zone } from "@/types/rules";

export interface CalendarEntry extends EntryOption {
  booked: boolean;
}

export type TripView =
  | { kind: "exempt"; passportCountry: string }
  | {
      kind: "inside";
      areaEntryDate: string;
      daysUsed: number;
      lastDay: string;
      daysLeftAfterToday: number;
    }
  | {
      kind: "overstay";
      areaEntryDate: string;
      daysUsed: number;
      overSince: string;
      daysOver: number;
      fullStayIfLeavingToday: string | null;
    }
  | { kind: "outside"; daysUsed: number; calendar: CalendarEntry[] };

export interface TripViewInput<T extends StayDates = StayDates> {
  rule: VisaRule;
  zones: Zone[];
  passportCountries: string[];
  stays: T[];
  today: string;
}

export interface TripOverstay<T extends StayDates> {
  areaEntryDate: string;
  lastLegalDay: string;
  daysOver: number;
  staysOver: T[];
}

function lastAreaDay(stays: StayDates[], area: Area): string | null {
  const days = stays
    .filter((stay) => area.has(stay.country))
    .map((stay) => stay.exit_date ?? stay.entry_date);
  return days.sort().at(-1) ?? null;
}

function daysUntilFullStay(rule: VisaRule): number {
  return rule.window.kind === "rolling" ? rule.window.periodDays - rule.allowedDays + 1 : 1;
}

export function reentryHorizonEnd(
  stays: StayDates[],
  rule: VisaRule,
  zones: Zone[],
  today: string,
): string {
  const last = lastAreaDay(stays, areaOf(rule.destination, zones));
  const settled = last ? addDays(last, daysUntilFullStay(rule)) : today;
  return endOfMonth(earlierDate(laterDate(today, settled), latestPlannableDay(today)));
}

function closeCurrentStayToday(stays: StayDates[], area: Area, today: string): StayDates[] {
  const current = stayCoveringDay(stays, area, today);
  return stays.map((stay) => (stay === current ? { ...stay, exit_date: today } : stay));
}

function exemptPassport(input: TripViewInput): string | null {
  const { rule, zones, passportCountries, today } = input;
  return (
    passportCountries.find((passportCountry) =>
      isExempt([rule], zones, rule.destination, passportCountry, today),
    ) ?? null
  );
}

export function buildTripView(input: TripViewInput): TripView {
  const { rule, zones, stays, today } = input;

  const exempt = exemptPassport(input);
  if (exempt) return { kind: "exempt", passportCountry: exempt };

  const status = visaStatus(stays, rule, zones, today);
  if (status && status.overstayed) {
    const closed = closeCurrentStayToday(stays, areaOf(rule.destination, zones), today);
    return {
      kind: "overstay",
      areaEntryDate: status.entryDate,
      daysUsed: status.daysUsed,
      overSince: addDays(status.mustLeaveBy, 1),
      daysOver: daysBetween(status.mustLeaveBy, today),
      fullStayIfLeavingToday: reentryOutlook(closed, rule, zones, addDays(today, 1)).fullStayFrom,
    };
  }
  if (status) {
    return {
      kind: "inside",
      areaEntryDate: status.entryDate,
      daysUsed: status.daysUsed,
      lastDay: status.mustLeaveBy,
      daysLeftAfterToday: daysBetween(today, status.mustLeaveBy),
    };
  }

  const horizonEnd = reentryHorizonEnd(stays, rule, zones, today);
  const area = areaOf(rule.destination, zones);
  const timeline = reentryTimeline(stays, rule, zones, today, daysBetween(today, horizonEnd) + 1);
  return {
    kind: "outside",
    daysUsed: reentryOutlook(stays, rule, zones, today).daysUsed,
    calendar: timeline.map((option) => ({
      ...option,
      booked: stayCoveringDay(stays, area, option.entryDate) !== null,
    })),
  };
}

function areaVisits<T extends StayDates>(stays: T[], area: Area, today: string): Map<string, T[]> {
  const visits = new Map<string, T[]>();
  for (const stay of stays) {
    if (!inAreaOn(area, stay.country, stay.exit_date ?? today)) continue;
    const entry = areaEntryDate(stays, area, stay);
    visits.set(entry, [...(visits.get(entry) ?? []), stay]);
  }
  return visits;
}

function visitOverstay<T extends StayDates>(
  input: TripViewInput<T>,
  entry: string,
  visitStays: T[],
): TripOverstay<T> | null {
  const { rule, zones, stays } = input;
  const exits = visitStays.map((stay) => stay.exit_date);
  if (exits.includes(null) || !inForce(rule, entry)) return null;
  const visitEnd = (exits as string[]).sort().at(-1) as string;
  const lastLegalDay = latestExitIfStaying(stays, rule, zones, entry);
  if (visitEnd <= lastLegalDay) return null;
  return {
    areaEntryDate: entry,
    lastLegalDay,
    daysOver: daysBetween(lastLegalDay, visitEnd),
    staysOver: visitStays.filter((stay) => (stay.exit_date as string) > lastLegalDay),
  };
}

export function tripOverstays<T extends StayDates>(input: TripViewInput<T>): TripOverstay<T>[] {
  if (exemptPassport(input)) return [];
  const area = areaOf(input.rule.destination, input.zones);
  return [...areaVisits(input.stays, area, input.today)]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([entry, visitStays]) => visitOverstay(input, entry, visitStays))
    .filter((overstay) => overstay !== null);
}
