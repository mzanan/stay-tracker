import type { passports, stays } from "@/lib/db/schema";

export type Passport = typeof passports.$inferSelect;
export type Stay = typeof stays.$inferSelect;
