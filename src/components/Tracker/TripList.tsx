import { ChevronRightIcon, PlusIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { countryName } from "@/lib/countries";
import { formatDay } from "@/lib/formatDate";
import type { LocalStay } from "@/lib/storage/localTrips";

interface TripListProps {
  stays: LocalStay[];
  today: string;
  overstayIds: Set<string>;
  onAdd: () => void;
  onOpen: (stayId: string) => void;
}

export function TripList({ stays, today, overstayIds, onAdd, onOpen }: TripListProps) {
  return (
    <Card size="lg">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Eyebrow>Trips</Eyebrow>
          <Button variant="outline" size="touch" onClick={onAdd}>
            <PlusIcon />
            Add trip
          </Button>
        </div>
        {stays.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No trips yet. Add your stays in Schengen from the last 180 days, and any you have planned.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {stays.map((stay) => (
              <li key={stay.id}>
                <Button
                  variant="ghost"
                  data-overstay={overstayIds.has(stay.id) || undefined}
                  className="group/trip h-auto w-full justify-between rounded-none px-0 py-3 text-left data-overstay:text-overstay"
                  onClick={() => onOpen(stay.id)}
                >
                  <span className="flex items-center gap-1.5 text-base font-medium">
                    {overstayIds.has(stay.id) && <TriangleAlertIcon aria-label="Over the limit" />}
                    {countryName(stay.country)}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground group-data-overstay/trip:text-overstay">
                    {formatDay(stay.entry_date, today)} →{" "}
                    {stay.exit_date ? formatDay(stay.exit_date, today) : "now"}
                    <ChevronRightIcon />
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
