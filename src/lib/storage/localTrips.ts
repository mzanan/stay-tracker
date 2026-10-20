import { z } from "zod";

import { MESSAGES } from "@/lib/constants/messages";

import { countryCodeSchema, idSchema, isoDateSchema } from "@/lib/schemas/common";

const STORAGE_KEY = "stay-tracker:v1";
const UNREADABLE_KEY_PREFIX = `${STORAGE_KEY}:unreadable:`;
const CHANGE_EVENT = "stay-tracker:change";

const localPassportSchema = z.object({
  id: idSchema,
  country: countryCodeSchema,
  expires_on: isoDateSchema.nullable(),
});

const localStaySchema = z.object({
  id: idSchema,
  country: countryCodeSchema,
  entry_date: isoDateSchema,
  exit_date: isoDateSchema.nullable(),
  passport_id: idSchema.nullable(),
});

export const localTripsSchema = z.object({
  version: z.literal(1),
  passports: z.array(localPassportSchema),
  stays: z.array(localStaySchema),
});

const storedShapeSchema = z.object({
  version: z.literal(1),
  passports: z.array(z.unknown()),
  stays: z.array(z.unknown()),
});

export type LocalTrips = z.infer<typeof localTripsSchema>;
export type LocalPassport = LocalTrips["passports"][number];
export type LocalStay = LocalTrips["stays"][number];

export const EMPTY_TRIPS: LocalTrips = { version: 1, passports: [], stays: [] };

let cachedRaw: string | null | undefined;
let cachedTrips: LocalTrips = EMPTY_TRIPS;
let sessionLoss: DataLoss | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function hasUnreadableCopy(raw: string): boolean {
  const storage = window.localStorage;
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (key?.startsWith(UNREADABLE_KEY_PREFIX) && storage.getItem(key) === raw) return true;
  }
  return false;
}

function keepUnreadable(raw: string): void {
  try {
    if (hasUnreadableCopy(raw)) return;
    window.localStorage.setItem(`${UNREADABLE_KEY_PREFIX}${Date.now()}`, raw);
  } catch {
    return;
  }
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function validRecords<T>(schema: z.ZodType<T>, records: unknown[]): T[] {
  return records.flatMap((record) => {
    const parsed = schema.safeParse(record);
    return parsed.success ? [parsed.data] : [];
  });
}

export type DataLoss = { kind: "all" } | { kind: "records"; trips: number; passports: number };

export interface ParsedLocalTrips {
  trips: LocalTrips;
  loss: DataLoss | null;
}

export function parseLocalTrips(raw: string | null): ParsedLocalTrips {
  if (raw === null) return { trips: EMPTY_TRIPS, loss: null };
  const shape = storedShapeSchema.safeParse(parseJson(raw));
  if (!shape.success) return { trips: EMPTY_TRIPS, loss: { kind: "all" } };
  const passports = validRecords(localPassportSchema, shape.data.passports);
  const stays = validRecords(localStaySchema, shape.data.stays);
  const lostTrips = shape.data.stays.length - stays.length;
  const lostPassports = shape.data.passports.length - passports.length;
  const loss: DataLoss | null =
    lostTrips + lostPassports > 0 ? { kind: "records", trips: lostTrips, passports: lostPassports } : null;
  return { trips: { version: 1, passports, stays }, loss };
}

function countOf(count: number, noun: string): string | null {
  if (count === 0) return null;
  return count === 1 ? `1 ${noun}` : `${count} ${noun}s`;
}

export function dataLossMessage(loss: DataLoss): string {
  if (loss.kind === "all") return MESSAGES.allDataUnreadable;
  const records = [countOf(loss.trips, "trip"), countOf(loss.passports, "passport")].filter(
    (part) => part !== null,
  );
  return MESSAGES.recordsUnreadable(records.join(" and "), loss.trips + loss.passports === 1);
}

export function readLocalTrips(): LocalTrips {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedTrips;
  cachedRaw = raw;
  const parsed = parseLocalTrips(raw);
  if (parsed.loss && raw !== null) {
    keepUnreadable(raw);
    sessionLoss = parsed.loss;
  }
  cachedTrips = parsed.trips;
  return cachedTrips;
}

export function readSessionDataLoss(): DataLoss | null {
  readLocalTrips();
  return sessionLoss;
}

export function noDataLoss(): DataLoss | null {
  return null;
}

export function writeLocalTrips(next: LocalTrips): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}

export function subscribeLocalTrips(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
