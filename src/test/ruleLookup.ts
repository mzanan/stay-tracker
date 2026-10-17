import { OFFICIAL_VISA_RULES, OFFICIAL_ZONES } from "@/lib/rules/official";
import type { VisaRule, Zone } from "@/types/rules";

export function officialRuleById(id: string): VisaRule {
  const rule = OFFICIAL_VISA_RULES.find((candidate) => candidate.id === id);
  if (!rule) throw new Error(`Missing official rule ${id}`);
  return rule;
}

export function officialZoneById(id: string): Zone {
  const zone = OFFICIAL_ZONES.find((candidate) => candidate.id === id);
  if (!zone) throw new Error(`Missing zone ${id}`);
  return zone;
}
