import { StatusHeadline } from "@/components/Tracker/StatusHeadline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDay, formatDays } from "@/lib/formatDate";
import { OVERSTAY_INFO_URL, SCHENGEN_RULE } from "@/lib/rules/schengen";
import type { TripView } from "@/lib/tripView";

interface OverstayStatusProps {
  view: Extract<TripView, { kind: "overstay" }>;
  today: string;
}

export function OverstayStatus({ view, today }: OverstayStatusProps) {
  const allowed = SCHENGEN_RULE.allowedDays;
  return (
    <>
      <StatusHeadline
        areaEntryDate={view.areaEntryDate}
        daysUsed={view.daysUsed}
        today={today}
        tone="alert"
        title={`You are ${formatDays(view.daysOver)} over`}
        detail={`Over the limit since ${formatDay(view.overSince, today)}.`}
      />
      <Alert variant="overstay">
        <AlertTitle>Leave the Schengen Area as soon as possible.</AlertTitle>
        <AlertDescription>
          <p>
            Every extra day adds to the overstay.
            {view.fullStayIfLeavingToday &&
              ` If you leave today, you can come back for a full ${allowed} days from ${formatDay(view.fullStayIfLeavingToday, today)}.`}
          </p>
          <p>
            Overstaying can lead to fines or an entry ban, depending on the country. The EU Entry/Exit
            System detects overstays automatically.{" "}
            <a href={OVERSTAY_INFO_URL} target="_blank" rel="noopener noreferrer">
              Learn more
            </a>
          </p>
        </AlertDescription>
      </Alert>
    </>
  );
}
