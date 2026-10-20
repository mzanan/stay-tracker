import { useState } from "react";

import { usePassportChoice } from "@/components/Tracker/usePassportChoice";
import type { TrackerActions } from "@/components/Tracker/useTracker";
import type { LocalPassport } from "@/lib/storage/localTrips";

export function usePassportPicker(passports: LocalPassport[], actions: TrackerActions) {
  const [open, setOpen] = useState(false);
  const passport = usePassportChoice(passports, actions);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) passport.cancelChange();
  };

  return { open, openDrawer: () => setOpen(true), onOpenChange, passport };
}
