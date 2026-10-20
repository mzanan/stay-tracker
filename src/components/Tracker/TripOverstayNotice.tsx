import { TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDay, formatDays } from "@/lib/formatDate";
import { SCHENGEN_RULE } from "@/lib/rules/schengen";
import type { LocalStay } from "@/lib/storage/localTrips";
import type { TripOverstay } from "@/lib/tripView";

interface TripOverstayNoticeProps {
  overstays: TripOverstay<LocalStay>[];
  today: string;
}

export function TripOverstayNotice({ overstays, today }: TripOverstayNoticeProps) {
  return (
    <Alert variant="overstay">
      <TriangleAlertIcon />
      <AlertTitle>
        {overstays.length === 1 ? "A trip goes" : `${overstays.length} trips go`} over the{" "}
        {SCHENGEN_RULE.allowedDays}-day limit
      </AlertTitle>
      <AlertDescription>
        <ul className="flex flex-col gap-1">
          {overstays.map((overstay) => (
            <li key={overstay.areaEntryDate}>
              Entering {formatDay(overstay.areaEntryDate, today)}: {formatDays(overstay.daysOver)} over.{" "}
              {overstay.lastDay.kind === "noDaysLeft" && "No days left on that date."}
              {overstay.lastDay.kind === "passed" &&
                `Your last legal day was ${formatDay(overstay.lastDay.date, today)}.`}
              {overstay.lastDay.kind === "upcoming" &&
                `You can stay until ${formatDay(overstay.lastDay.date, today)} inclusive.`}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
