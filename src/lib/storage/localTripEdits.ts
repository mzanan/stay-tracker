import { MESSAGES } from "@/lib/constants/messages";
import { passportInputSchema } from "@/lib/schemas/passports";
import { stayInputSchema } from "@/lib/schemas/stays";
import type { LocalTrips } from "@/lib/storage/localTrips";
import { lastPassportLocked } from "@/lib/passports";
import { stayConflictMessage, validateStay } from "@/lib/stays";
import { parseInput } from "@/lib/validation";
import type { ActionResult } from "@/types/actions";

export function addPassport(
  trips: LocalTrips,
  input: unknown,
  newId: string,
): ActionResult<LocalTrips> {
  const passport = parseInput(passportInputSchema, input, MESSAGES.invalidPassport);
  if (!passport.ok) return passport;
  if (trips.passports.some((existing) => existing.country === passport.data.country)) {
    return { ok: false, error: MESSAGES.passportAlreadyAdded };
  }
  return {
    ok: true,
    data: { ...trips, passports: [...trips.passports, { id: newId, ...passport.data }] },
  };
}

export function changePassport(
  trips: LocalTrips,
  id: string,
  input: unknown,
): ActionResult<LocalTrips> {
  const passport = parseInput(passportInputSchema, input, MESSAGES.invalidPassport);
  if (!passport.ok) return passport;
  if (!trips.passports.some((existing) => existing.id === id)) {
    return { ok: false, error: MESSAGES.passportNotFound };
  }
  if (trips.passports.some((existing) => existing.id !== id && existing.country === passport.data.country)) {
    return { ok: false, error: MESSAGES.passportAlreadyAdded };
  }
  return {
    ok: true,
    data: {
      ...trips,
      passports: trips.passports.map((existing) =>
        existing.id === id ? { id, ...passport.data } : existing,
      ),
    },
  };
}

export function removePassport(trips: LocalTrips, id: string): ActionResult<LocalTrips> {
  if (lastPassportLocked(trips.passports.length, trips.stays.length)) {
    return { ok: false, error: MESSAGES.lastPassportWithTrips };
  }
  return {
    ok: true,
    data: {
      ...trips,
      passports: trips.passports.filter((passport) => passport.id !== id),
      stays: trips.stays.map((stay) =>
        stay.passport_id === id ? { ...stay, passport_id: null } : stay,
      ),
    },
  };
}

export function saveStay(
  trips: LocalTrips,
  input: unknown,
  today: string,
  newId: string,
  stayId?: string,
): ActionResult<LocalTrips> {
  const stay = parseInput(stayInputSchema, input, MESSAGES.invalidStay);
  if (!stay.ok) return stay;
  if (stayId && !trips.stays.some((existing) => existing.id === stayId)) {
    return { ok: false, error: MESSAGES.stayNotFound };
  }
  const passportIds = trips.passports.map((passport) => passport.id);
  const conflict = validateStay(stay.data, trips.stays, passportIds, today, stayId);
  if (conflict) return { ok: false, error: stayConflictMessage(conflict) };

  const stays = stayId
    ? trips.stays.map((existing) => (existing.id === stayId ? { id: stayId, ...stay.data } : existing))
    : [...trips.stays, { id: newId, ...stay.data }];
  return { ok: true, data: { ...trips, stays } };
}

export function removeStay(trips: LocalTrips, id: string): LocalTrips {
  return { ...trips, stays: trips.stays.filter((stay) => stay.id !== id) };
}
