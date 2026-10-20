const KEY_PREFIX = "stay-tracker:dismissed:";
const CHANGE_EVENT = "stay-tracker:dismissed-change";

export function isDismissed(id: string): boolean {
  try {
    return window.localStorage.getItem(`${KEY_PREFIX}${id}`) === "1";
  } catch {
    return false;
  }
}

export function dismiss(id: string): void {
  try {
    window.localStorage.setItem(`${KEY_PREFIX}${id}`, "1");
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeDismissals(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
