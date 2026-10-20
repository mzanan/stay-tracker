"use client";

import { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { CalendarDay } from "@/components/Tracker/CalendarDay";
import { DayScaleLegend } from "@/components/Tracker/DayScaleLegend";
import { EntryDetail } from "@/components/Tracker/EntryDetail";
import { useReentryCalendar } from "@/components/Tracker/useReentryCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { formatMonth } from "@/lib/formatDate";
import { SCHENGEN_RULE } from "@/lib/rules/schengen";
import type { TripView } from "@/lib/tripView";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

interface ReentryCalendarProps {
  view: Extract<TripView, { kind: "outside" }>;
  today: string;
}

export function ReentryCalendar({ view, today }: ReentryCalendarProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const calendar = useReentryCalendar(view.calendar, gridRef);
  const allowed = SCHENGEN_RULE.allowedDays;

  return (
    <Card size="lg">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow>When can I come back</Eyebrow>
          <p className="text-sm text-muted-foreground">
            You are outside Schengen. {view.daysUsed} of {allowed} days used in the last 180. Tap a day to
            see how long you could stay.
          </p>
        </div>
        {calendar.month && (
          <>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon-lg"
                aria-label="Previous month"
                disabled={!calendar.canGoBack}
                onClick={calendar.goBack}
              >
                <ChevronLeftIcon />
              </Button>
              <p className="font-semibold">{formatMonth(calendar.month.start)}</p>
              <Button
                variant="outline"
                size="icon-lg"
                aria-label="Next month"
                disabled={!calendar.canGoForward}
                onClick={calendar.goForward}
              >
                <ChevronRightIcon />
              </Button>
            </div>
            <div
              ref={gridRef}
              onKeyDown={calendar.onGridKeyDown}
              className="grid grid-cols-7 gap-1"
              role="group"
              aria-label={`${formatMonth(calendar.month.start)}. Use the arrow keys to move between days.`}
            >
              {WEEKDAYS.map((weekday, index) => (
                <span key={index} className="text-center text-xs text-muted-foreground" aria-hidden="true">
                  {weekday}
                </span>
              ))}
              {Array.from({ length: calendar.month.leadingBlanks }, (_, index) => (
                <span key={`blank-${index}`} aria-hidden="true" />
              ))}
              {calendar.month.cells.map((cell) => (
                <CalendarDay
                  key={cell.iso}
                  cell={cell}
                  today={today}
                  selected={calendar.selected?.entryDate === cell.iso}
                  tabbable={calendar.tabbable === cell.iso}
                  onSelect={calendar.select}
                />
              ))}
            </div>
          </>
        )}
        {calendar.selected && <EntryDetail option={calendar.selected} today={today} />}
        <DayScaleLegend />
      </CardContent>
    </Card>
  );
}
