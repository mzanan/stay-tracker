import { z } from "zod";

import { countryCodeString, isoDateString } from "@/lib/schemas/common";

const isoDateField = isoDateString();
const countryField = countryCodeString();
const positiveDays = z.number().int().positive();

export const ruleSourceSchema = z
  .object({
    url: z.url(),
    official: z.boolean(),
    retrievedAt: isoDateField,
    verifiedAt: isoDateField.nullable(),
    underReview: z.boolean().default(false),
    note: z.string().nullable().default(null),
  })
  .strict();

const visaWindowSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("perEntry") }).strict(),
  z.object({ kind: z.literal("rolling"), periodDays: positiveDays }).strict(),
]);

export const visaRuleSchema = z
  .object({
    id: z.string().min(1),
    destination: z.string().min(1),
    passports: z.union([z.literal("all"), z.array(countryField)]),
    exemptPassports: z.array(countryField).default([]),
    allowedDays: positiveDays,
    window: visaWindowSchema.default({ kind: "perEntry" }),
    extensionDays: positiveDays.nullable().default(null),
    reportingIntervalDays: positiveDays.nullable().default(null),
    validFrom: isoDateField.nullable().default(null),
    validUntil: isoDateField.nullable().default(null),
    source: ruleSourceSchema,
  })
  .strict();

const zoneMemberSchema = z
  .object({ country: countryField, memberFrom: isoDateField, source: ruleSourceSchema })
  .strict();

export const zoneSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    members: z.array(zoneMemberSchema).min(1),
    source: ruleSourceSchema,
  })
  .strict();

const taxPeriodSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("calendarYear") }).strict(),
  z
    .object({
      kind: z.literal("taxYear"),
      startMonth: z.number().int().min(1).max(12),
      startDay: z.number().int().min(1).max(31),
    })
    .strict(),
  z.object({ kind: z.literal("rolling"), periodDays: positiveDays }).strict(),
]);

export const taxRuleSchema = z
  .object({
    country: countryField,
    thresholdDays: positiveDays,
    period: taxPeriodSchema,
    dayCounting: z.enum(["inclusive", "midnight"]),
    source: ruleSourceSchema,
  })
  .strict();

export const ruleFileSchema = z
  .object({
    visaRules: z.array(visaRuleSchema).default([]),
    taxRules: z.array(taxRuleSchema).default([]),
    zones: z.array(zoneSchema).default([]),
  })
  .strict();
