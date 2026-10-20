import { ChevronRightIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { countryName } from "@/lib/countries";
import { formatDay } from "@/lib/formatDate";
import type { LocalStay } from "@/lib/storage/localTrips";

interface TripListProps {
  stays: LocalStay[];
  today: string;
  onAdd: () => void;
  onOpen: (stayId: string) => void;
}

export function TripList({ stays, today, onAdd, onOpen }: TripListProps) {
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
                  className="h-auto w-full justify-between rounded-none px-0 py-3 text-left"
                  onClick={() => onOpen(stay.id)}
                >
                  <span className="text-base font-medium">{countryName(stay.country)}</span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
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
