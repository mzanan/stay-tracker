import { isCountryCode } from "@/lib/countries";
import { isIsoDate, isoDate } from "@/lib/dates";
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
    ...countryListErrors(`zone ${zone.id}`, zone.members.map((member) => member.country)),
    ...zone.members
      .filter((member) => !isIsoDate(member.memberFrom))
      .map((member) => `zone ${zone.id}: invalid memberFrom for ${member.country}`),
  ]);
  const seenIds = new Set<string>();
  for (const rule of visaRules) {
    if (seenIds.has(rule.id)) errors.push(`visa rule ${rule.id}: duplicate id`);
    seenIds.add(rule.id);
    errors.push(...visaRuleErrors(rule, zoneIds));
  }
  const taxCountries = new Set<string>();
  for (const rule of taxRules) {
    if (taxCountries.has(rule.country)) errors.push(`tax rule ${rule.country}: duplicate country`);
    taxCountries.add(rule.country);
    errors.push(...taxRuleErrors(rule));
  }
  return errors;
}
