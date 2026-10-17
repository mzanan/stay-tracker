import { z } from "zod";

import { MESSAGES } from "@/lib/constants/messages";
import { isCountryCode } from "@/lib/countries";
import { isIsoDate } from "@/lib/dates";

export function countryCodeString(message?: string) {
  return z.string().refine(isCountryCode, message ? { message } : undefined);
}

export function isoDateString(message?: string) {
  return z.string().refine(isIsoDate, message ? { message } : undefined);
}

export const countryCodeSchema = countryCodeString(MESSAGES.unknownCountry);

export const isoDateSchema = isoDateString(MESSAGES.invalidDate);

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
