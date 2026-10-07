import { z } from "zod";

import { MESSAGES } from "@/lib/constants/messages";
import { isCountryCode } from "@/lib/countries";
import { isIsoDate } from "@/lib/dates";

export const countryCodeSchema = z
  .string()
  .refine(isCountryCode, { message: MESSAGES.unknownCountry });

export const isoDateSchema = z
  .string()
  .refine(isIsoDate, { message: MESSAGES.invalidDate });

export const idSchema = z.uuid({ message: MESSAGES.invalidId }).toLowerCase();

export function emptyAsNull<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    schema.nullable(),
  );
}

export function emptyStringAsNull<T extends z.ZodType>(schema: T) {
  return z.preprocess((value) => (value === "" ? null : value), schema.nullable());
}
