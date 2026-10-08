import { cambodiaVisaRules } from "@/lib/rules/content/cambodia";
import { indonesiaTaxRule, indonesiaVisaRules } from "@/lib/rules/content/indonesia";
import { malaysiaTaxRule } from "@/lib/rules/content/malaysia";
import { schengenVisaRules, schengenZone } from "@/lib/rules/content/schengen";
import { thailandTaxRule, thailandVisaRules } from "@/lib/rules/content/thailand";
import { vietnamVisaRules } from "@/lib/rules/content/vietnam";

import type { TaxRule, VisaRule, Zone } from "@/types/rules";

export const OFFICIAL_VISA_RULES: VisaRule[] = [
  ...thailandVisaRules,
  ...vietnamVisaRules,
  ...cambodiaVisaRules,
  ...indonesiaVisaRules,
  ...schengenVisaRules,
];

export const OFFICIAL_TAX_RULES: TaxRule[] = [thailandTaxRule, indonesiaTaxRule, malaysiaTaxRule];

export const OFFICIAL_ZONES: Zone[] = [schengenZone];
