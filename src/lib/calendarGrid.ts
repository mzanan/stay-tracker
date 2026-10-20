import { addDays, endOfMonth, isoDate } from "@/lib/dates";
import type { CalendarEntry } from "@/lib/tripView";

export interface CalendarCell {
  iso: string;
  day: number;
  option: CalendarEntry | null;
}

export interface CalendarMonth {
  start: string;
  leadingBlanks: number;
  cells: CalendarCell[];
}

function monthStart(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

function mondayFirstWeekday(iso: string): number {
  return (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;
}

function nextMonthStart(start: string): string {
  return addDays(endOfMonth(start), 1);
}

function buildMonth(start: string, byIso: Map<string, CalendarEntry>): CalendarMonth {
  const [year, month] = start.split("-").map(Number);
  const lastDay = Number(endOfMonth(start).slice(8));
  const cells = Array.from({ length: lastDay }, (_, index) => {
    const iso = isoDate(year, month, index + 1);
    return { iso, day: index + 1, option: byIso.get(iso) ?? null };
  });
  return { start, leadingBlanks: mondayFirstWeekday(start), cells };
}

export function calendarMonths(options: CalendarEntry[]): CalendarMonth[] {
  if (options.length === 0) return [];
  const byIso = new Map(options.map((option) => [option.entryDate, option]));
  const last = monthStart(options[options.length - 1].entryDate);
  const months: CalendarMonth[] = [];
  for (let start = monthStart(options[0].entryDate); start <= last; start = nextMonthStart(start)) {
    months.push(buildMonth(start, byIso));
  }
  return months;
}

export function firstOpenEntry(options: CalendarEntry[]): CalendarEntry | null {
  return options.find((option) => option.maxStayDays > 0) ?? options[0] ?? null;
}

export function lastStayDay(option: CalendarEntry): string {
  return addDays(option.entryDate, option.maxStayDays - 1);
}

export function monthIndexOf(months: CalendarMonth[], iso: string | null): number {
  if (iso === null) return 0;
  return Math.max(0, months.findIndex((month) => month.start === monthStart(iso)));
}

export function clampIndex(index: number, length: number): number {
  return Math.min(Math.max(index, 0), Math.max(length - 1, 0));
}

export function tabbableIso(month: CalendarMonth | null, selectedIso: string | null): string | null {
  if (!month) return null;
  const open = month.cells.filter((cell) => cell.option !== null);
  return open.find((cell) => cell.iso === selectedIso)?.iso ?? open[0]?.iso ?? null;
}
