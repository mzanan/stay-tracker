import "server-only";

import {
  OFFICIAL_TAX_RULES,
  OFFICIAL_VISA_RULES,
  OFFICIAL_ZONES,
} from "@/lib/rules/content";
import { communitySource, defineVisaRule } from "@/lib/rules/define";
import passportIndex from "@/lib/rules/seed/passportIndex.json";
import { stayCoveringDay } from "@/lib/rules/presence";
import { validateRuleSet } from "@/lib/rules/validate";
import { destinationsFor, findVisaRule, visaStatus, type VisaStatus } from "@/lib/rules/visa";
import type { EntryRequirement, EntryRequirementKind, StayDates, VisaRule } from "@/types/rules";

type SeedValue = number | EntryRequirementKind;

const ruleSetErrors = validateRuleSet(OFFICIAL_VISA_RULES, OFFICIAL_TAX_RULES, OFFICIAL_ZONES);
if (ruleSetErrors.length > 0) {
  throw new Error(`Invalid rule set:\n${ruleSetErrors.join("\n")}`);
}

const seedSource = communitySource(
  passportIndex.source,
  passportIndex.retrievedAt,
  `Community dataset scraped from passportindex.org, data as of ${passportIndex.dataAsOf}; not an official source.`,
);
const seedData = passportIndex.data as Record<string, Record<string, SeedValue>>;
const seedDataAsOf = passportIndex.dataAsOf;

function officialRulesFor(destination: string): VisaRule[] {
  const destinations = destinationsFor(destination, OFFICIAL_ZONES);
  return OFFICIAL_VISA_RULES.filter((rule) => destinations.includes(rule.destination));
}

function lists(rule: VisaRule, passportCountry: string): boolean {
  return rule.passports === "all" || rule.passports.includes(passportCountry);
}

function seedIsStale(destination: string, passportCountry: string, onDate: string): boolean {
  return officialRulesFor(destination).some((rule) => {
    const changedAfterSeed =
      rule.validFrom !== null && rule.validFrom > seedDataAsOf && rule.validFrom <= onDate;
    const lapsedAfterSeed =
      rule.validUntil !== null &&
      rule.validUntil >= seedDataAsOf &&
      rule.validUntil < onDate &&
      lists(rule, passportCountry);
    return changedAfterSeed || lapsedAfterSeed;
  });
}

function seedValue(destination: string, passportCountry: string): SeedValue | null {
  return seedData[passportCountry]?.[destination] ?? null;
}

function seedVisaRule(
  destination: string,
  passportCountry: string,
  onDate: string,
): VisaRule | null {
  const value = seedValue(destination, passportCountry);
  if (typeof value !== "number" || seedIsStale(destination, passportCountry, onDate)) return null;
  return defineVisaRule({
    id: `seed-${passportCountry}-${destination}`,
    destination,
    passports: [passportCountry],
    allowedDays: value,
    source: seedSource,
  });
}

export function visaRulesFor(
  destination: string,
  passportCountries: string[],
  onDate: string,
): VisaRule[] {
  const seeded = passportCountries
    .map((passportCountry) => seedVisaRule(destination, passportCountry, onDate))
    .filter((rule): rule is VisaRule => rule !== null);
  return [...OFFICIAL_VISA_RULES, ...seeded];
}

export function seedEntryRequirement(
  destination: string,
  passportCountry: string,
  onDate: string,
): EntryRequirement | null {
  const value = seedValue(destination, passportCountry);
  if (value === null || seedIsStale(destination, passportCountry, onDate)) return null;
  if (typeof value === "number") return { kind: "visaFree", days: value, source: seedSource };
  return { kind: value, days: null, source: seedSource };
}

export function currentVisaStatus(
  stays: StayDates[],
  destination: string,
  passportCountry: string,
  today: string,
): VisaStatus | null {
  const current = stayCoveringDay(stays, new Set([destination]), today);
  if (!current) return null;
  const rules = visaRulesFor(destination, [passportCountry], current.entry_date);
  const rule = findVisaRule(rules, OFFICIAL_ZONES, destination, passportCountry, current.entry_date);
  return rule ? visaStatus(stays, rule, OFFICIAL_ZONES, today) : null;
}
