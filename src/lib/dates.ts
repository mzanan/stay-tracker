import type { DateRange } from "@/types/dates";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcMs(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function fromUtcMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const year = Number(value.slice(0, 4));
  if (year < MIN_YEAR || year > MAX_YEAR) return false;
  const ms = toUtcMs(value);
  return !Number.isNaN(ms) && fromUtcMs(ms) === value;
}

export function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function addDays(date: string, days: number): string {
  return fromUtcMs(toUtcMs(date) + days * MS_PER_DAY);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

export function earlierDate(a: string, b: string): string {
  return a < b ? a : b;
}

export function laterDate(a: string, b: string): string {
  return a > b ? a : b;
}

export function eachDay(from: string, to: string): string[] {
  const days: string[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) days.push(day);
  return days;
}

export function endOfMonth(date: string): string {
  const [year, month] = date.split("-").map(Number);
  return addDays(isoDate(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 1), -1);
}

export function trailingWindow(day: string, periodDays: number): DateRange {
  return { start: addDays(day, -(periodDays - 1)), end: day };
}
