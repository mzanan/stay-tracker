"use client";

import { use } from "react";
import { browser } from "react-dom";

import { AppHeader } from "@/components/Tracker/AppHeader";
import { DataLossNotice } from "@/components/Tracker/DataLossNotice";
import { FirstUse } from "@/components/Tracker/FirstUse";
import { LocalDataBanner } from "@/components/Tracker/LocalDataBanner";
import { ReentryCalendar } from "@/components/Tracker/ReentryCalendar";
import { RuleSourceLine } from "@/components/Tracker/RuleSourceLine";
import { StatusCard } from "@/components/Tracker/StatusCard";
import { TripDrawer } from "@/components/Tracker/TripDrawer";
import { TripList } from "@/components/Tracker/TripList";
import { TripOverstayNotice } from "@/components/Tracker/TripOverstayNotice";
import { useTracker } from "@/components/Tracker/useTracker";

export function Tracker() {
  use(browser("Trips are stored in localStorage and dated with the traveller's local day."));
  const tracker = useTracker();

  return (
    <div className="flex flex-col gap-4">
      <AppHeader
        passports={tracker.passports}
        lastPassportLocked={tracker.lastPassportLocked}
        actions={tracker.actions}
      />
      <LocalDataBanner />
      {tracker.dataLossNotice && <DataLossNotice message={tracker.dataLossNotice} />}
      {tracker.passports.length === 0 ? (
        <FirstUse actions={tracker.actions} onAddFirstTrip={tracker.openNewTrip} />
      ) : (
        <>
          {tracker.overstays.length > 0 && (
            <TripOverstayNotice overstays={tracker.overstays} today={tracker.today} />
          )}
          {tracker.view.kind === "outside" ? (
            <ReentryCalendar view={tracker.view} today={tracker.today} />
          ) : (
            <StatusCard view={tracker.view} today={tracker.today} />
          )}
          <TripList
            stays={tracker.stays}
            today={tracker.today}
            overstayIds={tracker.overstayIds}
            onAdd={tracker.openNewTrip}
            onOpen={tracker.openTrip}
          />
        </>
      )}
      <RuleSourceLine />
      <TripDrawer
        target={tracker.tripDrawer}
        stay={tracker.editingStay}
        today={tracker.today}
        actions={tracker.actions}
        onClose={tracker.closeTrip}
      />
    </div>
  );
}
