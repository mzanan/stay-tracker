import { addDays, daysBetween, trailingWindow } from "@/lib/dates";
import { areaEntryDate, presenceDays, stayCoveringDay } from "@/lib/rules/presence";
import type { StayDates, VisaRule, Zone } from "@/types/rules";

export interface VisaStatus {
  rule: VisaRule;
  entryDate: string;
  daysUsed: number;
  daysLeft: number;
  mustLeaveBy: string;
  overstayed: boolean;
  nextReportDue: string | null;
}

export interface PassportOption {
  passportCountry: string;
  rule: VisaRule | null;
}

export function areaOf(destination: string, zones: Zone[]): ReadonlySet<string> {
  const zone = zones.find((candidate) => candidate.id === destination);
  return new Set(zone ? zone.members : [destination]);
}

function zonesContaining(country: string, zones: Zone[]): string[] {
  return zones.filter((zone) => zone.members.includes(country)).map((zone) => zone.id);
}

function appliesToPassport(rule: VisaRule, passportCountry: string): boolean {
  return rule.passports === "all" || rule.passports.includes(passportCountry);
}

function specificity(rule: VisaRule, country: string): number {
  const passportSpecific = rule.passports === "all" ? 0 : 2;
  const countrySpecific = rule.destination === country ? 1 : 0;
  return passportSpecific + countrySpecific;
}

export function findVisaRule(
  rules: VisaRule[],
  zones: Zone[],
  country: string,
  passportCountry: string,
): VisaRule | null {
  const destinations = [country, ...zonesContaining(country, zones)];
  const matches = rules.filter(
    (rule) => destinations.includes(rule.destination) && appliesToPassport(rule, passportCountry),
  );
  return (
    matches.sort(
      (a, b) =>
        specificity(b, country) - specificity(a, country) || b.allowedDays - a.allowedDays,
    )[0] ?? null
  );
}

export function rankPassports(
  rules: VisaRule[],
  zones: Zone[],
  country: string,
  passportCountries: string[],
): PassportOption[] {
  const options = passportCountries.map((passportCountry) => ({
    passportCountry,
    rule: findVisaRule(rules, zones, country, passportCountry),
  }));
  return options.sort((a, b) => {
    if (!a.rule || !b.rule) return Number(Boolean(b.rule)) - Number(Boolean(a.rule));
    return b.rule.allowedDays - a.rule.allowedDays;
  });
}

function rollingUsage(
  stays: StayDates[],
  area: ReadonlySet<string>,
  periodDays: number,
  day: string,
): number {
  return presenceDays(stays, area, trailingWindow(day, periodDays), day).size;
}

export function latestExitIfStaying(
  stays: StayDates[],
  rule: VisaRule,
  zones: Zone[],
  entryDate: string,
): string {
  if (rule.window.kind === "perEntry") return addDays(entryDate, rule.allowedDays - 1);

  const { periodDays } = rule.window;
  const area = areaOf(rule.destination, zones);
  const earlierStays = stays.filter((stay) => stay.entry_date < entryDate);
  const earlierDays = presenceDays(
    earlierStays,
    area,
    trailingWindow(addDays(entryDate, -1), periodDays - 1),
    entryDate,
  );

  let latestOk = addDays(entryDate, -1);
  for (let offset = 0; offset < periodDays; offset++) {
    const day = addDays(entryDate, offset);
    const windowStart = trailingWindow(day, periodDays).start;
    const earlierInWindow = [...earlierDays].filter((earlier) => earlier >= windowStart).length;
    if (earlierInWindow + offset + 1 > rule.allowedDays) break;
    latestOk = day;
  }
  return latestOk;
}

function nextReportDue(
  entryDate: string,
  intervalDays: number | null,
  today: string,
): string | null {
  if (!intervalDays) return null;
  const elapsed = daysBetween(entryDate, today);
  const periods = Math.max(1, Math.ceil(elapsed / intervalDays));
  return addDays(entryDate, periods * intervalDays);
}

export function visaStatus(
  stays: StayDates[],
  rule: VisaRule,
  zones: Zone[],
  today: string,
): VisaStatus | null {
  const area = areaOf(rule.destination, zones);
  const current = stayCoveringDay(stays, area, today);
  if (!current) return null;

  const entryDate = areaEntryDate(stays, area, current);
  const daysUsed =
    rule.window.kind === "perEntry"
      ? daysBetween(entryDate, today) + 1
      : rollingUsage(stays, area, rule.window.periodDays, today);
  const mustLeaveBy = latestExitIfStaying(stays, rule, zones, entryDate);

  return {
    rule,
    entryDate,
    daysUsed,
    daysLeft: Math.max(0, rule.allowedDays - daysUsed),
    mustLeaveBy,
    overstayed: today > mustLeaveBy,
    nextReportDue: nextReportDue(current.entry_date, rule.reportingIntervalDays, today),
  };
}
