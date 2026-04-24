const EVENT = "development-stub";

/** Открыть нижний лист «Раздел в разработке». Аргумент hint не отображается (совместимость вызовов). */
export function openDevelopmentStub(hint?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: hint ?? "" }));
}
