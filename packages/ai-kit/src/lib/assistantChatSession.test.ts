import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "./mockData";
import {
  clearAssistantChatSession,
  hydrateThreadIfEmptyInUi,
  loadAssistantChatSession,
  persistAssistantChatSession
} from "./assistantChatSession";

const sample: ChatMessage[] = [
  { id: "1", role: "user", text: "привет", createdAt: "2026-01-01T00:00:00.000Z" }
];

function stubSessionStorage() {
  const map = new Map<string, string>();
  const sessionStorage = {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      map.set(String(key), String(value));
    },
    removeItem(key: string) {
      map.delete(key);
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    }
  };
  vi.stubGlobal("window", { sessionStorage } as Window & typeof globalThis);
}

describe("assistantChatSession", () => {
  beforeEach(() => {
    stubSessionStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hydrateThreadIfEmptyInUi подставляет сохранённый тред, если в UI пусто", () => {
    persistAssistantChatSession(sample);
    expect(hydrateThreadIfEmptyInUi([])).toEqual(sample);
  });

  it("hydrateThreadIfEmptyInUi не меняет непустой UI-тред", () => {
    persistAssistantChatSession(sample);
    const ui: ChatMessage[] = [
      { id: "x", role: "ai", text: "ок", createdAt: "2026-01-02T00:00:00.000Z" }
    ];
    expect(hydrateThreadIfEmptyInUi(ui)).toEqual(ui);
  });

  it("после clearAssistantChatSession снимок не читается", () => {
    persistAssistantChatSession(sample);
    clearAssistantChatSession();
    expect(loadAssistantChatSession()).toBeNull();
  });
});
