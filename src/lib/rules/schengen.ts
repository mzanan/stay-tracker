import { isZoneMember, zoneCountries } from "@/lib/rules/area";
import { OFFICIAL_VISA_RULES, OFFICIAL_ZONES } from "@/lib/rules/official";
import type { VisaRule, Zone } from "@/types/rules";

const SCHENGEN_ZONE_ID = "SCHENGEN";
const SCHENGEN_RULE_ID = "schengen-short-stay";

function requireZone(): Zone {
  const zone = OFFICIAL_ZONES.find((candidate) => candidate.id === SCHENGEN_ZONE_ID);
  if (!zone) throw new Error(`Missing zone ${SCHENGEN_ZONE_ID}`);
  return zone;
}

function requireRule(): VisaRule {
  const rule = OFFICIAL_VISA_RULES.find((candidate) => candidate.id === SCHENGEN_RULE_ID);
  if (!rule) throw new Error(`Missing visa rule ${SCHENGEN_RULE_ID}`);
  return rule;
}

export const SCHENGEN_ZONE = requireZone();
export const SCHENGEN_ZONES: Zone[] = [SCHENGEN_ZONE];
export const SCHENGEN_RULE = requireRule();
export const SCHENGEN_RULE_TITLE = "Regulation (EU) 2016/399";
export const OVERSTAY_INFO_URL =
  "https://home-affairs.ec.europa.eu/policies/schengen/smart-borders/entry-exit-system_en";

export function schengenMembersOn(day: string): string[] {
  return zoneCountries(SCHENGEN_ZONE).filter((country) =>
    isZoneMember(SCHENGEN_ZONE, country, day),
  );
}
