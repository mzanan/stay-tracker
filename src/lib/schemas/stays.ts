import { z } from "zod";

import { MESSAGES } from "@/lib/constants/messages";
import { exitBeforeEntry } from "@/lib/stays";

import { countryCodeSchema, emptyAsNull, idSchema, isoDateSchema } from "./common";

export const stayInputSchema = z
  .object({
    country: countryCodeSchema,
    entry_date: isoDateSchema,
    exit_date: emptyAsNull(isoDateSchema),
    passport_id: emptyAsNull(idSchema),
  })
  .refine(
    (stay) => !exitBeforeEntry(stay.entry_date, stay.exit_date),
    { message: MESSAGES.exitBeforeEntry, path: ["exit_date"] },
  );

export type StayInput = z.infer<typeof stayInputSchema>;
