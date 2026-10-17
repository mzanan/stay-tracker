import { addDays, earlierDate, eachDay, isoDate, laterDate, trailingWindow } from "@/lib/dates";
import { countryArea } from "@/lib/rules/area";
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

function lastPlannedDay(stays: StayDates[], country: string, today: string): string {
  return stays
    .filter((stay) => stay.country === country && stay.exit_date !== null)
    .reduce((latest, stay) => laterDate(latest, stay.exit_date ?? latest), today);
}

function projectedPresence(
  stays: StayDates[],
  rule: TaxRule,
  period: DateRange,
  today: string,
): number {
  const country = countryArea(rule.country);
  if (rule.period.kind !== "rolling") {
    return presenceDays(stays, country, period, today, rule.dayCounting).size;
  }
  const { periodDays } = rule.period;
  const horizon = lastPlannedDay(stays, rule.country, today);
  const days = presenceDays(
    stays,
    country,
    { start: trailingWindow(today, periodDays).start, end: horizon },
    today,
    rule.dayCounting,
  );
  let peak = 0;
  for (const windowEnd of eachDay(today, horizon)) {
    const windowStart = trailingWindow(windowEnd, periodDays).start;
    const count = [...days].filter((day) => day >= windowStart && day <= windowEnd).length;
    peak = Math.max(peak, count);
  }
  return peak;
}

export function taxStatus(stays: StayDates[], rule: TaxRule, today: string): TaxStatus {
  const period = taxPeriodFor(rule, today);
  const country = countryArea(rule.country);
  const soFar = { start: period.start, end: earlierDate(period.end, today) };
  const daysPresent = presenceDays(stays, country, soFar, today, rule.dayCounting).size;
  const projectedDays = projectedPresence(stays, rule, period, today);
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
