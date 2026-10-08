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
const NOT_IN_SCHENGEN = new Set(["CY", "IE"]);

export const schengenZone: Zone = {
  id: SCHENGEN_ID,
  name: "Schengen Area",
  members: [...EU_MEMBERS.filter((code) => !NOT_IN_SCHENGEN.has(code)), ...FREE_MOVEMENT_NON_EU],
  source: officialSource(
    "https://home-affairs.ec.europa.eu/policies/schengen/schengen-area_en",
    RETRIEVED_AT,
    "29 countries; Bulgaria and Romania joined on 1 Jan 2025. The page gives the count, not the names.",
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
