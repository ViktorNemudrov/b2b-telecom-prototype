const EVENT = "development-stub";

/** Открыть нижний лист «Раздел в разработке» с необязательной подсказкой. */
export function openDevelopmentStub(hint?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: hint ?? "" }));
}
