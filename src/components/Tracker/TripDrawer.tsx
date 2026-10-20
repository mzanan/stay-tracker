"use client";

import { TripForm } from "@/components/Tracker/TripForm";
import type { TrackerActions, TripDrawerTarget } from "@/components/Tracker/useTracker";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { LocalStay } from "@/lib/storage/localTrips";

interface TripDrawerProps {
  target: TripDrawerTarget | null;
  stay: LocalStay | null;
  today: string;
  actions: TrackerActions;
  onClose: () => void;
}

export function TripDrawer({ target, stay, today, actions, onClose }: TripDrawerProps) {
  return (
    <Drawer
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{stay ? "Edit trip" : "Add trip"}</DrawerTitle>
        </DrawerHeader>
        {target && (
          <TripForm
            key={target.mode === "edit" ? target.stayId : "new"}
            stay={stay}
            today={today}
            actions={actions}
            onDone={onClose}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}
