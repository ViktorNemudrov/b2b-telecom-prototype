import * as React from "react";
import type { AppealItem } from "@shared/lib/mockData";

const STORAGE_KEY = "b2b-classic.runtimeAppeals.v1";

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function isHistoryEntry(x: unknown): boolean {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.at === "string" && typeof o.text === "string";
}

function isAppealRecord(x: unknown): x is AppealItem {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.status === "string" &&
    typeof o.badgeLabel === "string" &&
    typeof o.category === "string" &&
    typeof o.dateLabel === "string" &&
    typeof o.description === "string" &&
    Array.isArray(o.history) &&
    o.history.every(isHistoryEntry)
  );
}

export function loadRuntimeUserAppeals(): AppealItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAppealRecord);
  } catch {
    return [];
  }
}

function saveRuntimeUserAppeals(items: AppealItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota / private mode */
  }
}

/** Добавить пользовательское обращение (в начало списка) и сохранить в браузере. */
export function appendRuntimeUserAppeal(item: AppealItem): void {
  const next = [item, ...loadRuntimeUserAppeals()];
  saveRuntimeUserAppeals(next);
  emit();
}

export function subscribeRuntimeUserAppeals(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) listener();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

/**
 * Обращения, созданные пользователем на этом устройстве (localStorage).
 * После монтирования совпадает с хранилищем; обновляется при добавлении и при изменении в другой вкладке.
 */
export function useRuntimeUserAppeals(): AppealItem[] {
  const [appeals, setAppeals] = React.useState<AppealItem[]>([]);

  React.useEffect(() => {
    setAppeals(loadRuntimeUserAppeals());
    return subscribeRuntimeUserAppeals(() => setAppeals(loadRuntimeUserAppeals()));
  }, []);

  return appeals;
}
