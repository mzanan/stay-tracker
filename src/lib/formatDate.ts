import { isoDate } from "@/lib/dates";

const DAY_MONTH = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const DAY_MONTH_YEAR = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const MONTH_YEAR = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

function toUtcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function formatDay(iso: string, today: string): string {
  const sameYear = iso.slice(0, 4) === today.slice(0, 4);
  return (sameYear ? DAY_MONTH : DAY_MONTH_YEAR).format(toUtcDate(iso));
}

export function formatFullDay(iso: string): string {
  return DAY_MONTH_YEAR.format(toUtcDate(iso));
}

export function formatMonth(iso: string): string {
  return MONTH_YEAR.format(toUtcDate(iso));
}

export function localIsoDate(now: Date): string {
  return isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function formatDays(count: number): string {
  return count === 1 ? "1 day" : `${count} days`;
}
