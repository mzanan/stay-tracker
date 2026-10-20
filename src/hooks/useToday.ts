import { useSyncExternalStore } from "react";

import { localIsoDate } from "@/lib/formatDate";

const RECHECK_MS = 60_000;

function subscribe(onChange: () => void): () => void {
  const interval = window.setInterval(onChange, RECHECK_MS);
  document.addEventListener("visibilitychange", onChange);
  window.addEventListener("focus", onChange);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", onChange);
    window.removeEventListener("focus", onChange);
  };
}

function snapshot(): string {
  return localIsoDate(new Date());
}

export function useToday(): string {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
