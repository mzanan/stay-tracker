import { defineVisaRule, officialSource } from "@/lib/rules/define";
import type { VisaRule, Zone } from "@/types/rules";

const RETRIEVED_AT = "2026-10-08";
const SCHENGEN_ID = "SCHENGEN";
const SHORT_STAY_DAYS = 90;
const SHORT_STAY_PERIOD_DAYS = 180;

const EU_MEMBERS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
];
const FREE_MOVEMENT_NON_EU = ["IS", "NO", "LI", "CH"];
const ZONE_RETRIEVED_AT = "2026-10-17";

const MEMBER_FROM: Record<string, string> = {
  BE: "1995-03-26", DE: "1995-03-26", ES: "1995-03-26", FR: "1995-03-26",
  LU: "1995-03-26", NL: "1995-03-26", PT: "1995-03-26",
  IT: "1997-10-26", AT: "1997-12-01", GR: "2000-03-26",
  DK: "2001-03-25", FI: "2001-03-25", IS: "2001-03-25", NO: "2001-03-25", SE: "2001-03-25",
  CZ: "2007-12-21", EE: "2007-12-21", HU: "2007-12-21", LV: "2007-12-21", LT: "2007-12-21",
  MT: "2007-12-21", PL: "2007-12-21", SK: "2007-12-21", SI: "2007-12-21",
  CH: "2008-12-12", LI: "2011-12-19",
  HR: "2023-01-01",
  BG: "2024-03-31", RO: "2024-03-31",
};

export const schengenZone: Zone = {
  id: SCHENGEN_ID,
  name: "Schengen Area",
  members: Object.entries(MEMBER_FROM).map(([country, memberFrom]) => ({ country, memberFrom })),
  source: officialSource(
    "https://home-affairs.ec.europa.eu/policies/schengen/schengen-area_en",
    ZONE_RETRIEVED_AT,
    "memberFrom = date Articles 18-22 of the Schengen Convention (90/180 short stay) apply, whatever the border type. HR: Council Decision (EU) 2022/2451 Art. 1(1). BG/RO: Council Decision (EU) 2024/210 Art. 1 (air and sea checks lifted that day, land checks only on 2025-01-01, stays count from 2024-03-31). Pre-2013 dates from national government summaries, not re-verified against the Official Journal; they predate the 90/180 rule.",
  ),
};

export const schengenVisaRules: VisaRule[] = [
  defineVisaRule({
    id: "schengen-short-stay",
    destination: SCHENGEN_ID,
    passports: "all",
    exemptPassports: [...EU_MEMBERS, ...FREE_MOVEMENT_NON_EU],
    allowedDays: SHORT_STAY_DAYS,
    window: { kind: "rolling", periodDays: SHORT_STAY_PERIOD_DAYS },
    source: officialSource(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0399",
      RETRIEVED_AT,
      "Schengen Borders Code Art. 6: 90 days in any 180; entry and exit days both count. Some nationalities still need a visa; bilateral waivers can add days in single countries (not tracked yet).",
    ),
  }),
];
