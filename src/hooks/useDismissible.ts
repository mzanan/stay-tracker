import { useSyncExternalStore } from "react";

import { dismiss, isDismissed, subscribeDismissals } from "@/lib/storage/dismissals";

function notDismissed(): boolean {
  return false;
}

export function useDismissible(id: string) {
  const dismissed = useSyncExternalStore(subscribeDismissals, () => isDismissed(id), notDismissed);
  return { dismissed, dismiss: () => dismiss(id) };
}
