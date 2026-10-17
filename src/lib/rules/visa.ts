import { addDays, daysBetween, trailingWindow } from "@/lib/dates";
import { areaEntryDate, countryArea, presenceDays, stayCoveringDay } from "@/lib/rules/presence";
import type { Area, StayDates, VisaRule, Zone } from "@/types/rules";

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
  exempt: boolean;
  rule: VisaRule | null;
}

const OFFICIAL_WEIGHT = 4;
const PASSPORT_WEIGHT = 2;
const COUNTRY_WEIGHT = 1;

export function areaOf(destination: string, zones: Zone[]): Area {
  const zone = zones.find((candidate) => candidate.id === destination);
  if (!zone) return countryArea(destination);
  return new Map(zone.members.map((member) => [member.country, member.memberFrom]));
}

export function destinationsFor(country: string, zones: Zone[]): string[] {
  const zoneIds = zones.filter((zone) => zone.members.some((member) => member.country === country)).map((zone) => zone.id);
  return [country, ...zoneIds];
}

export function inForce(rule: VisaRule, onDate: string): boolean {
  if (rule.validFrom && onDate < rule.validFrom) return false;
  return !rule.validUntil || onDate <= rule.validUntil;
}

function appliesToPassport(rule: VisaRule, passportCountry: string): boolean {
  if (rule.exemptPassports.includes(passportCountry)) return false;
  return rule.passports === "all" || rule.passports.includes(passportCountry);
}

export function isExempt(
  rules: VisaRule[],
  zones: Zone[],
  country: string,
  passportCountry: string,
  onDate: string,
): boolean {
  const destinations = destinationsFor(country, zones);
  return rules.some(
    (rule) =>
      destinations.includes(rule.destination) &&
      rule.exemptPassports.includes(passportCountry) &&
      inForce(rule, onDate),
  );
}

function specificity(rule: VisaRule, country: string): number {
  const official = rule.source.official ? OFFICIAL_WEIGHT : 0;
  const passportSpecific = rule.passports === "all" ? 0 : PASSPORT_WEIGHT;
  const countrySpecific = rule.destination === country ? COUNTRY_WEIGHT : 0;
  return official + passportSpecific + countrySpecific;
}

export function findVisaRule(
  rules: VisaRule[],
  zones: Zone[],
  country: string,
  passportCountry: string,
  onDate: string,
): VisaRule | null {
  const destinations = destinationsFor(country, zones);
  const matches = rules.filter(
    (rule) =>
      destinations.includes(rule.destination) &&
      appliesToPassport(rule, passportCountry) &&
      inForce(rule, onDate),
  );
  return (
    matches.sort(
      (a, b) =>
        specificity(b, country) - specificity(a, country) || b.allowedDays - a.allowedDays,
    )[0] ?? null
  );
}

function optionRank(option: PassportOption): number {
  if (option.exempt) return Number.POSITIVE_INFINITY;
  return option.rule ? option.rule.allowedDays : Number.NEGATIVE_INFINITY;
}

export function rankPassports(
  rules: VisaRule[],
  zones: Zone[],
  country: string,
  passportCountries: string[],
  onDate: string,
): PassportOption[] {
  const options = passportCountries.map((passportCountry) => ({
    passportCountry,
    exempt: isExempt(rules, zones, country, passportCountry, onDate),
    rule: findVisaRule(rules, zones, country, passportCountry, onDate),
  }));
  return options.sort((a, b) => optionRank(b) - optionRank(a));
}

export function rollingUsage(
  stays: StayDates[],
  area: Area,
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

  const sortedEarlier = [...earlierDays].sort();
  let droppedOut = 0;
  let latestOk = addDays(entryDate, -1);
  for (let offset = 0; offset < periodDays; offset++) {
    const day = addDays(entryDate, offset);
    const windowStart = trailingWindow(day, periodDays).start;
    while (droppedOut < sortedEarlier.length && sortedEarlier[droppedOut] < windowStart) droppedOut++;
    const earlierInWindow = sortedEarlier.length - droppedOut;
    if (earlierInWindow + offset + 1 > rule.allowedDays) break;
    latestOk = day;
  }
  return latestOk;
}

export function maxStayDays(
  stays: StayDates[],
  rule: VisaRule,
  zones: Zone[],
  entryDate: string,
): number {
  return daysBetween(entryDate, latestExitIfStaying(stays, rule, zones, entryDate)) + 1;
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
