import { Title } from "@/components/ui/title";
import { lastStayDay } from "@/lib/calendarGrid";
import { dayTier } from "@/lib/dayScale";
import { formatDay, formatDays } from "@/lib/formatDate";
import { SCHENGEN_RULE } from "@/lib/rules/schengen";
import type { CalendarEntry } from "@/lib/tripView";

interface EntryDetailProps {
  option: CalendarEntry;
  today: string;
}

export function EntryDetail({ option, today }: EntryDetailProps) {
  const entry = formatDay(option.entryDate, today);
  const tier = dayTier(option.maxStayDays, SCHENGEN_RULE.allowedDays);
  return (
    <div className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {option.booked ? (
        <>
          <Title>Trip planned</Title>
          <p className="mt-1 text-sm">You already have a trip in Schengen on {entry}.</p>
        </>
      ) : tier === "none" ? (
        <>
          <Title>Cannot enter</Title>
          <p className="mt-1 text-sm">On {entry} you would already be over the limit.</p>
        </>
      ) : (
        <>
          <Title>
            {formatDays(option.maxStayDays)}
            {tier === "full" && <span className="ml-2 text-base font-semibold text-muted-foreground">full stay</span>}
          </Title>
          <p className="mt-1 text-sm">
            If you enter on <b>{entry}</b>, you can stay until <b>{formatDay(lastStayDay(option), today)}</b>{" "}
            inclusive.
          </p>
        </>
      )}
    </div>
  );
}
