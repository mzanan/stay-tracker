import { addDays, daysBetween, endOfMonth, laterDate } from "@/lib/dates";
import { stayCoveringDay } from "@/lib/rules/presence";
import { reentryOutlook, reentryTimeline, type EntryOption } from "@/lib/rules/reentry";
import { areaOf, isExempt, visaStatus } from "@/lib/rules/visa";
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

export interface TripViewInput {
  rule: VisaRule;
  zones: Zone[];
  passportCountries: string[];
  stays: StayDates[];
  today: string;
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
  return endOfMonth(laterDate(today, settled));
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
