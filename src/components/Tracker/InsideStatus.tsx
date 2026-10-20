import { StatusHeadline } from "@/components/Tracker/StatusHeadline";
import { formatDay, formatDays } from "@/lib/formatDate";
import type { TripView } from "@/lib/tripView";

interface InsideStatusProps {
  view: Extract<TripView, { kind: "inside" }>;
  today: string;
}

export function InsideStatus({ view, today }: InsideStatusProps) {
  return (
    <StatusHeadline
      areaEntryDate={view.areaEntryDate}
      daysUsed={view.daysUsed}
      today={today}
      tone="default"
      title={`You can stay until ${formatDay(view.lastDay, today)} inclusive`}
      detail={
        view.daysLeftAfterToday === 0
          ? "Today is your last day."
          : `${formatDays(view.daysLeftAfterToday)} left after today.`
      }
    />
  );
}
