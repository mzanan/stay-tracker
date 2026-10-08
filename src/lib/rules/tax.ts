import { addDays, earlierDate, isoDate, trailingWindow } from "@/lib/dates";
import { presenceDays } from "@/lib/rules/presence";
import type { DateRange } from "@/types/dates";
import type { StayDates, TaxRule } from "@/types/rules";

export interface TaxStatus {
  rule: TaxRule;
  period: DateRange;
  daysPresent: number;
  daysUntilResident: number;
  overThreshold: boolean;
  projectedDays: number;
  projectedOverThreshold: boolean;
}

export function taxPeriodFor(rule: TaxRule, day: string): DateRange {
  const year = Number(day.slice(0, 4));
  const { period } = rule;
  if (period.kind === "calendarYear") {
    return { start: isoDate(year, 1, 1), end: isoDate(year, 12, 31) };
  }
  if (period.kind === "rolling") return trailingWindow(day, period.periodDays);

  const startYear =
    day >= isoDate(year, period.startMonth, period.startDay) ? year : year - 1;
  const start = isoDate(startYear, period.startMonth, period.startDay);
  const nextStart = isoDate(startYear + 1, period.startMonth, period.startDay);
  return { start, end: addDays(nextStart, -1) };
}

export function taxStatus(stays: StayDates[], rule: TaxRule, today: string): TaxStatus {
  const period = taxPeriodFor(rule, today);
  const country = new Set([rule.country]);
  const soFar = { start: period.start, end: earlierDate(period.end, today) };
  const daysPresent = presenceDays(stays, country, soFar, today, rule.dayCounting).size;
  const projectedDays = presenceDays(stays, country, period, today, rule.dayCounting).size;
  return {
    rule,
    period,
    daysPresent,
    daysUntilResident: Math.max(0, rule.thresholdDays - daysPresent),
    overThreshold: daysPresent >= rule.thresholdDays,
    projectedDays,
    projectedOverThreshold: projectedDays >= rule.thresholdDays,
  };
}
