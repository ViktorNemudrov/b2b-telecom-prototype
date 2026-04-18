import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppealItem } from "@shared/lib/mockData";
import { appendRuntimeUserAppeal, loadRuntimeUserAppeals, subscribeRuntimeUserAppeals } from "./runtimeAppeals";

const sample: AppealItem = {
  id: "new-1",
  title: "Тест",
  status: "active",
  badgeLabel: "В работе",
  category: "Техподдержка",
  dateLabel: "01.01.26",
  description: "Текст",
  history: [{ at: "10:00", text: "Отправлено." }]
};

describe("runtimeAppeals", () => {
  const store: Record<string, string> = {};

  const mockLocalStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] ?? null
  };

  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    vi.stubGlobal("localStorage", mockLocalStorage);
    vi.stubGlobal("window", {
      localStorage: mockLocalStorage,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("append persists and load returns saved appeals", () => {
    expect(loadRuntimeUserAppeals()).toEqual([]);
    appendRuntimeUserAppeal(sample);
    const loaded = loadRuntimeUserAppeals();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.id).toBe("new-1");
    expect(loaded[0]?.description).toBe("Текст");
  });

  it("subscribe runs when append is called", () => {
    let count = 0;
    const unsub = subscribeRuntimeUserAppeals(() => {
      count += 1;
    });
    appendRuntimeUserAppeal(sample);
    expect(count).toBe(1);
    unsub();
  });
});
