import type { ReactNode } from "react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progressRing";
import { Title } from "@/components/ui/title";
import { formatDay } from "@/lib/formatDate";
import { SCHENGEN_RULE } from "@/lib/rules/schengen";

interface StatusHeadlineProps {
  areaEntryDate: string;
  daysUsed: number;
  today: string;
  tone: "default" | "alert";
  title: ReactNode;
  detail: ReactNode;
}

export function StatusHeadline({ areaEntryDate, daysUsed, today, tone, title, detail }: StatusHeadlineProps) {
  const allowed = SCHENGEN_RULE.allowedDays;
  return (
    <>
      <Badge variant="status">
        <span className={cn("size-2 rounded-full", tone === "alert" ? "bg-overstay" : "bg-day-full")} />
        In Schengen since {formatDay(areaEntryDate, today)}
      </Badge>
      <div className="flex items-center gap-5">
        <ProgressRing
          tone={tone}
          value={daysUsed}
          max={allowed}
          label={daysUsed}
          caption={`of ${allowed}`}
          ariaLabel={`${daysUsed} of ${allowed} days used in the last 180`}
        />
        <div className="flex flex-col gap-1">
          <Title>{title}</Title>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
      </div>
    </>
  );
}
