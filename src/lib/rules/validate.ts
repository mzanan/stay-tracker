import { isCountryCode } from "@/lib/countries";
import { zoneCountries } from "@/lib/rules/area";
import { isIsoDate, isoDate } from "@/lib/dates";
import { appliesToPassport } from "@/lib/rules/visa";
import type { RuleSource, TaxRule, VisaRule, Zone } from "@/types/rules";

const FEBRUARY = 2;
const LEAP_DAY = 29;
const NON_LEAP_YEAR = 2025;

function sourceErrors(label: string, source: RuleSource): string[] {
  const errors: string[] = [];
  if (!source.url.startsWith("https://")) errors.push(`${label}: source url must be https`);
  if (!isIsoDate(source.retrievedAt)) errors.push(`${label}: invalid retrievedAt`);
  if (source.verifiedAt !== null && !isIsoDate(source.verifiedAt)) {
    errors.push(`${label}: invalid verifiedAt`);
  }
  if (source.official && source.verifiedAt === null && !source.underReview) {
    errors.push(`${label}: official source needs verifiedAt or underReview`);
  }
  return errors;
}

const OPEN_START = "0000-01-01";
const OPEN_END = "9999-12-31";

function validityOverlaps(a: VisaRule, b: VisaRule): boolean {
  return (
    (a.validFrom ?? OPEN_START) <= (b.validUntil ?? OPEN_END) &&
    (b.validFrom ?? OPEN_START) <= (a.validUntil ?? OPEN_END)
  );
}

function sharedPassports(a: VisaRule, b: VisaRule): string[] | "all" {
  if (a.passports === "all" && b.passports === "all") return "all";
  const listed = a.passports === "all" ? (b.passports as string[]) : a.passports;
  return listed.filter((passport) => appliesToPassport(a, passport) && appliesToPassport(b, passport));
}

function exemptButListed(exempting: VisaRule, listing: VisaRule): string[] {
  return exempting.exemptPassports.filter((passport) => appliesToPassport(listing, passport));
}

function overlapErrors(visaRules: VisaRule[]): string[] {
  const errors: string[] = [];
  visaRules.forEach((a, index) => {
    for (const b of visaRules.slice(index + 1)) {
      if (a.destination !== b.destination || !validityOverlaps(a, b)) continue;
      const shared = sharedPassports(a, b);
      if (shared === "all" || shared.length > 0) {
        const passports = shared === "all" ? "all passports" : shared.join(", ");
        errors.push(`visa rules ${a.id} and ${b.id}: overlap for ${passports}`);
      }
      for (const [exempting, listing] of [[a, b], [b, a]]) {
        const conflicting = exemptButListed(exempting, listing);
        if (conflicting.length > 0) {
          errors.push(
            `visa rules ${exempting.id} and ${listing.id}: ${conflicting.join(", ")} exempt in one, listed in the other`,
          );
        }
      }
    }
  });
  return errors;
}

function countryListErrors(label: string, codes: string[]): string[] {
  return codes.filter((code) => !isCountryCode(code)).map((code) => `${label}: unknown country ${code}`);
}

function visaRuleErrors(rule: VisaRule, zoneIds: ReadonlySet<string>): string[] {
  const label = `visa rule ${rule.id}`;
  const errors = [...sourceErrors(label, rule.source)];
  if (!isCountryCode(rule.destination) && !zoneIds.has(rule.destination)) {
    errors.push(`${label}: unknown destination ${rule.destination}`);
  }
  if (rule.passports !== "all") errors.push(...countryListErrors(label, rule.passports));
  errors.push(...countryListErrors(label, rule.exemptPassports));
  if (rule.passports !== "all") {
    const both = rule.passports.filter((passport) => rule.exemptPassports.includes(passport));
    if (both.length > 0) errors.push(`${label}: ${both.join(", ")} both listed and exempt`);
  }
  if (!Number.isInteger(rule.allowedDays) || rule.allowedDays <= 0) {
    errors.push(`${label}: allowedDays must be a positive integer`);
  }
  if (rule.window.kind === "rolling" && rule.allowedDays >= rule.window.periodDays) {
    errors.push(`${label}: allowedDays must be shorter than the rolling period`);
  }
  if (rule.validFrom && !isIsoDate(rule.validFrom)) errors.push(`${label}: invalid validFrom`);
  if (rule.validUntil && !isIsoDate(rule.validUntil)) errors.push(`${label}: invalid validUntil`);
  if (rule.validFrom && rule.validUntil && rule.validFrom > rule.validUntil) {
    errors.push(`${label}: validFrom after validUntil`);
  }
  return errors;
}

function taxRuleErrors(rule: TaxRule): string[] {
  const label = `tax rule ${rule.country}`;
  const errors = [...sourceErrors(label, rule.source)];
  if (!isCountryCode(rule.country)) errors.push(`${label}: unknown country`);
  if (rule.thresholdDays <= 0) errors.push(`${label}: thresholdDays must be positive`);
  if (rule.period.kind === "taxYear") {
    const { startMonth, startDay } = rule.period;
    if (startMonth === FEBRUARY && startDay === LEAP_DAY) {
      errors.push(`${label}: tax year cannot start on 29 February`);
    } else if (!isIsoDate(isoDate(NON_LEAP_YEAR, startMonth, startDay))) {
      errors.push(`${label}: invalid tax year start`);
    }
  }
  return errors;
}

export function validateRuleSet(
  visaRules: VisaRule[],
  taxRules: TaxRule[],
  zones: Zone[],
): string[] {
  const zoneIds = new Set(zones.map((zone) => zone.id));
  const errors = zones.flatMap((zone) => [
    ...sourceErrors(`zone ${zone.id}`, zone.source),
    ...countryListErrors(`zone ${zone.id}`, zoneCountries(zone)),
    ...zone.members
      .filter((member) => !isIsoDate(member.memberFrom))
      .map((member) => `zone ${zone.id}: invalid memberFrom for ${member.country}`),
    ...zone.members.flatMap((member) => sourceErrors(`zone ${zone.id} member ${member.country}`, member.source)),
  ]);
  const seenIds = new Set<string>();
  for (const rule of visaRules) {
    if (seenIds.has(rule.id)) errors.push(`visa rule ${rule.id}: duplicate id`);
    seenIds.add(rule.id);
    errors.push(...visaRuleErrors(rule, zoneIds));
  }
  errors.push(...overlapErrors(visaRules));
  const taxCountries = new Set<string>();
  for (const rule of taxRules) {
    if (taxCountries.has(rule.country)) errors.push(`tax rule ${rule.country}: duplicate country`);
    taxCountries.add(rule.country);
    errors.push(...taxRuleErrors(rule));
  }
  return errors;
}
