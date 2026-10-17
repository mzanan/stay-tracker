import type { Area, Zone } from "@/types/rules";

const ALWAYS_MEMBER = "0000-01-01";

export function countryArea(country: string): Area {
  return new Map([[country, ALWAYS_MEMBER]]);
}

export function zoneArea(zone: Zone): Area {
  return new Map(zone.members.map((member) => [member.country, member.memberFrom]));
}

export function zoneCountries(zone: Zone): string[] {
  return zone.members.map((member) => member.country);
}

export function isZoneMember(zone: Zone, country: string, onDate: string | null): boolean {
  return zone.members.some(
    (member) => member.country === country && (onDate === null || onDate >= member.memberFrom),
  );
}

export function inAreaOn(area: Area, country: string, day: string): boolean {
  const memberFrom = area.get(country);
  return memberFrom !== undefined && day >= memberFrom;
}
