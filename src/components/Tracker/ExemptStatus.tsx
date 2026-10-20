import { Title } from "@/components/ui/title";
import { countryName } from "@/lib/countries";
import type { TripView } from "@/lib/tripView";

interface ExemptStatusProps {
  view: Extract<TripView, { kind: "exempt" }>;
}

export function ExemptStatus({ view }: ExemptStatusProps) {
  return (
    <div className="flex flex-col gap-1">
      <Title>No 90-day limit</Title>
      <p className="text-sm text-muted-foreground">
        With your {countryName(view.passportCountry)} passport, the 90/180 rule does not apply to you.
      </p>
    </div>
  );
}
