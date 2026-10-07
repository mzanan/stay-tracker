import { z } from "zod";

import { countryCodeSchema, emptyAsNull, emptyStringAsNull, isoDateSchema } from "./common";

export const passportInputSchema = z.object({
  country: countryCodeSchema,
  expires_on: emptyAsNull(isoDateSchema),
});

export const passportExpirySchema = z.object({
  expires_on: emptyStringAsNull(isoDateSchema),
});

export type PassportInput = z.infer<typeof passportInputSchema>;
