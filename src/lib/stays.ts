import { MESSAGES } from "@/lib/constants/messages";
import { laterDate } from "@/lib/dates";
import { formatFullDay } from "@/lib/formatDate";
import type { StayInput } from "@/lib/schemas/stays";
import type { Stay } from "@/types/db";

type StayRange = Pick<Stay, "entry_date" | "exit_date">;
type ExistingStay = Pick<Stay, "id" | "country" | "entry_date" | "exit_date">;

export type StayConflict =
  | { kind: "passportNotFound" }
  | { kind: "overlap"; entryDate: string }
  | { kind: "splitStay"; date: string };

function startsBeforeEndOf(start: string, range: StayRange): boolean {
  return range.exit_date === null || start < range.exit_date;
}

function startsOnOrBeforeEndOf(start: string, range: StayRange): boolean {
  return range.exit_date === null || start <= range.exit_date;
}

function staysOverlap(a: StayRange, b: StayRange): boolean {
  return startsBeforeEndOf(a.entry_date, b) && startsBeforeEndOf(b.entry_date, a);
}

function sharedBoundaryDay(a: StayRange, b: StayRange): string | null {
  const touches =
    startsOnOrBeforeEndOf(a.entry_date, b) && startsOnOrBeforeEndOf(b.entry_date, a);
  if (!touches) return null;
  return laterDate(a.entry_date, b.entry_date);
}

function isSameStay(a: StayInput, b: ExistingStay): boolean {
  return (
    a.country === b.country && a.entry_date === b.entry_date && a.exit_date === b.exit_date
  );
}

export function stayConflictMessage(conflict: StayConflict): string {
  if (conflict.kind === "passportNotFound") return MESSAGES.passportNotFound;
  if (conflict.kind === "overlap") return MESSAGES.overlap(formatFullDay(conflict.entryDate));
  return MESSAGES.splitStay(formatFullDay(conflict.date));
}

export function exitBeforeEntry(entryDate: string, exitDate: string | null): boolean {
  return exitDate !== null && exitDate !== "" && exitDate < entryDate;
}

export function coversDay(range: StayRange, day: string): boolean {
  return range.entry_date <= day && (range.exit_date === null || day <= range.exit_date);
}

export function validateStay(
  input: StayInput,
  existingStays: ExistingStay[],
  passportIds: string[],
  ignoreStayId?: string,
): StayConflict | null {
  if (input.passport_id && !passportIds.includes(input.passport_id)) {
    return { kind: "passportNotFound" };
  }
  const others = existingStays.filter((stay) => stay.id !== ignoreStayId);

  const overlapping = others.find(
    (stay) => staysOverlap(input, stay) || isSameStay(input, stay),
  );
  if (overlapping) return { kind: "overlap", entryDate: overlapping.entry_date };

  for (const stay of others) {
    if (stay.country !== input.country) continue;
    const day = sharedBoundaryDay(input, stay);
    if (day === null) continue;
    const crossedBorder = others.some(
      (other) => other.country !== input.country && coversDay(other, day),
    );
    if (!crossedBorder) return { kind: "splitStay", date: day };
  }
  return null;
}

export function newestFirst<T extends StayRange>(stays: T[]): T[] {
  return [...stays].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
}
