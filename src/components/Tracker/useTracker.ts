import { useMemo, useState, useSyncExternalStore } from "react";

import { useToday } from "@/hooks/useToday";
import { MESSAGES } from "@/lib/constants/messages";
import { SCHENGEN_RULE, SCHENGEN_ZONES } from "@/lib/rules/schengen";
import {
  EMPTY_TRIPS,
  readLocalTrips,
  subscribeLocalTrips,
  writeLocalTrips,
  type LocalTrips,
} from "@/lib/storage/localTrips";
import { addPassport, removePassport, removeStay, saveStay } from "@/lib/storage/localTripEdits";
import { newestFirst } from "@/lib/stays";
import { buildTripView, tripOverstays } from "@/lib/tripView";
import type { ActionResult } from "@/types/actions";

export type TripDrawerTarget = { mode: "new" } | { mode: "edit"; stayId: string };

export interface TrackerActions {
  addPassport: (country: string) => ActionResult;
  removePassport: (id: string) => ActionResult;
  saveStay: (input: unknown, stayId?: string) => ActionResult;
  removeStay: (id: string) => ActionResult;
}

export function useTracker() {
  const trips = useSyncExternalStore(subscribeLocalTrips, readLocalTrips, () => EMPTY_TRIPS);
  const today = useToday();
  const [tripDrawer, setTripDrawer] = useState<TripDrawerTarget | null>(null);

  const viewInput = useMemo(
    () => ({
      rule: SCHENGEN_RULE,
      zones: SCHENGEN_ZONES,
      passportCountries: trips.passports.map((passport) => passport.country),
      stays: trips.stays,
      today,
    }),
    [trips, today],
  );
  const view = useMemo(() => buildTripView(viewInput), [viewInput]);
  const overstays = useMemo(() => tripOverstays(viewInput), [viewInput]);
  const overstayIds = useMemo(
    () => new Set(overstays.flatMap((overstay) => overstay.staysOver.map((stay) => stay.id))),
    [overstays],
  );
  const stays = useMemo(() => newestFirst(trips.stays), [trips.stays]);
  const editingStay =
    tripDrawer?.mode === "edit"
      ? (trips.stays.find((stay) => stay.id === tripDrawer.stayId) ?? null)
      : null;

  const commit = (result: ActionResult<LocalTrips>): ActionResult => {
    if (!result.ok) return result;
    if (!writeLocalTrips(result.data)) return { ok: false, error: MESSAGES.saveLocalFailed };
    return { ok: true, data: undefined };
  };

  const actions: TrackerActions = {
    addPassport: (country) => commit(addPassport(trips, { country }, crypto.randomUUID())),
    removePassport: (id) => commit({ ok: true, data: removePassport(trips, id) }),
    saveStay: (input, stayId) => commit(saveStay(trips, input, crypto.randomUUID(), stayId)),
    removeStay: (id) => commit({ ok: true, data: removeStay(trips, id) }),
  };

  return {
    today,
    view,
    overstays,
    overstayIds,
    passports: trips.passports,
    stays,
    actions,
    tripDrawer,
    editingStay,
    openNewTrip: () => setTripDrawer({ mode: "new" }),
    openTrip: (stayId: string) => setTripDrawer({ mode: "edit", stayId }),
    closeTrip: () => setTripDrawer(null),
  };
}
