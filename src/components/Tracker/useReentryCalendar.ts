import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";

import { calendarMonths, clampIndex, firstOpenEntry, monthIndexOf, tabbableIso } from "@/lib/calendarGrid";
import type { CalendarEntry } from "@/lib/tripView";

const KEY_STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

export function useReentryCalendar(options: CalendarEntry[], gridRef: RefObject<HTMLDivElement | null>) {
  const months = useMemo(() => calendarMonths(options), [options]);
  const initial = useMemo(() => firstOpenEntry(options), [options]);
  const [selectedIso, setSelectedIso] = useState<string | null>(initial?.entryDate ?? null);
  const [monthIndex, setMonthIndex] = useState(() => monthIndexOf(months, initial?.entryDate ?? null));
  const focusAfterMove = useRef(false);

  const selected = options.find((option) => option.entryDate === selectedIso) ?? initial;
  const safeIndex = clampIndex(monthIndex, months.length);
  const month = months[safeIndex] ?? null;

  useEffect(() => {
    if (!focusAfterMove.current || !selected) return;
    focusAfterMove.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-iso="${selected.entryDate}"]`)?.focus();
  }, [selected, safeIndex, gridRef]);

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = KEY_STEPS[event.key];
    if (step === undefined || !selected) return;
    event.preventDefault();
    const index = options.findIndex((option) => option.entryDate === selected.entryDate);
    const next = options[clampIndex(index + step, options.length)];
    focusAfterMove.current = true;
    setSelectedIso(next.entryDate);
    setMonthIndex(monthIndexOf(months, next.entryDate));
  };

  return {
    month,
    selected,
    tabbable: tabbableIso(month, selected?.entryDate ?? null),
    onGridKeyDown,
    select: setSelectedIso,
    canGoBack: safeIndex > 0,
    canGoForward: safeIndex < months.length - 1,
    goBack: () => setMonthIndex(clampIndex(safeIndex - 1, months.length)),
    goForward: () => setMonthIndex(clampIndex(safeIndex + 1, months.length)),
  };
}
