const EVENT = "cursor-label";

/** Sets the text shown next to the custom cursor (e.g. "VIEW"), or clears it. */
export function setCursorLabel(label: string | null) {
  window.dispatchEvent(new CustomEvent<string | null>(EVENT, { detail: label }));
}

export function onCursorLabel(callback: (label: string | null) => void) {
  function handler(e: Event) {
    callback((e as CustomEvent<string | null>).detail);
  }
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
