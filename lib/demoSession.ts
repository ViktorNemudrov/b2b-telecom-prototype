const KEY = "b2b_demo_session_v1";

export function hasDemoSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function setDemoSession(): void {
  window.localStorage.setItem(KEY, "1");
}

export function clearDemoSession(): void {
  window.localStorage.removeItem(KEY);
}
