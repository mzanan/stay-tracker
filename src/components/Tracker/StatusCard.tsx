import { ExemptStatus } from "@/components/Tracker/ExemptStatus";
import { InsideStatus } from "@/components/Tracker/InsideStatus";
import { OverstayStatus } from "@/components/Tracker/OverstayStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { TripView } from "@/lib/tripView";

interface StatusCardProps {
  view: Exclude<TripView, { kind: "outside" }>;
  today: string;
}

export function StatusCard({ view, today }: StatusCardProps) {
  return (
    <Card size="lg">
      <CardContent className="flex flex-col gap-4">
        <Eyebrow>Today</Eyebrow>
        {view.kind === "exempt" && <ExemptStatus view={view} />}
        {view.kind === "inside" && <InsideStatus view={view} today={today} />}
        {view.kind === "overstay" && <OverstayStatus view={view} today={today} />}
      </CardContent>
    </Card>
  );
}
