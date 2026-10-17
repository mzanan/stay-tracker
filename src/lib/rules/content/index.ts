import cambodia from "@/lib/rules/data/cambodia.json";
import indonesia from "@/lib/rules/data/indonesia.json";
import malaysia from "@/lib/rules/data/malaysia.json";
import schengen from "@/lib/rules/data/schengen.json";
import thailand from "@/lib/rules/data/thailand.json";
import vietnam from "@/lib/rules/data/vietnam.json";
import { ruleFileSchema } from "@/lib/rules/schema";
import type { TaxRule, VisaRule, Zone } from "@/types/rules";

const ruleFiles = [thailand, vietnam, cambodia, indonesia, schengen, malaysia].map((file) =>
  ruleFileSchema.parse(file),
);

export const OFFICIAL_VISA_RULES: VisaRule[] = ruleFiles.flatMap((file) => file.visaRules);

export const OFFICIAL_TAX_RULES: TaxRule[] = ruleFiles.flatMap((file) => file.taxRules);

export const OFFICIAL_ZONES: Zone[] = ruleFiles.flatMap((file) => file.zones);
