import cambodia from "@/lib/rules/official/cambodia.json";
import indonesia from "@/lib/rules/official/indonesia.json";
import malaysia from "@/lib/rules/official/malaysia.json";
import schengen from "@/lib/rules/official/schengen.json";
import thailand from "@/lib/rules/official/thailand.json";
import vietnam from "@/lib/rules/official/vietnam.json";
import { ruleFileSchema } from "@/lib/schemas/rules";
import type { TaxRule, VisaRule, Zone } from "@/types/rules";

const ruleFiles = [thailand, vietnam, cambodia, indonesia, schengen, malaysia].map((file) =>
  ruleFileSchema.parse(file),
);

export const OFFICIAL_VISA_RULES: VisaRule[] = ruleFiles.flatMap((file) => file.visaRules);

export const OFFICIAL_TAX_RULES: TaxRule[] = ruleFiles.flatMap((file) => file.taxRules);

export const OFFICIAL_ZONES: Zone[] = ruleFiles.flatMap((file) => file.zones);
