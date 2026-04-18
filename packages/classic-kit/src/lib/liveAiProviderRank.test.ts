import { describe, expect, it } from "vitest";
import {
  fingerprintLiveProviders,
  orderCandidatesFromStored,
  type LiveProviderCandidate
} from "./liveAiProviderRank";

describe("liveAiProviderRank", () => {
  it("fingerprint is stable regardless of candidate array order", () => {
    const a: LiveProviderCandidate[] = [
      { provider: "groq", apiKey: "k", model: "m1" },
      { provider: "gemini", apiKey: "k", model: "m2" }
    ];
    const b: LiveProviderCandidate[] = [
      { provider: "gemini", apiKey: "k", model: "m2" },
      { provider: "groq", apiKey: "k", model: "m1" }
    ];
    expect(fingerprintLiveProviders(a)).toBe(fingerprintLiveProviders(b));
  });

  it("orderCandidatesFromStored restores provider order", () => {
    const candidates: LiveProviderCandidate[] = [
      { provider: "gemini", apiKey: "gk", model: "gemini-2.0-flash" },
      { provider: "groq", apiKey: "gk", model: "llama" }
    ];
    const stored = {
      v: 1 as const,
      fingerprint: fingerprintLiveProviders(candidates),
      measuredAt: Date.now(),
      order: ["groq", "gemini"] as const,
      ms: { groq: 100, gemini: 500 }
    };
    const ordered = orderCandidatesFromStored(candidates, stored);
    expect(ordered?.map((c) => c.provider)).toEqual(["groq", "gemini"]);
  });

  it("orderCandidatesFromStored returns null when fingerprint mismatches", () => {
    const candidates: LiveProviderCandidate[] = [{ provider: "groq", apiKey: "k", model: "x" }];
    const stored = {
      v: 1 as const,
      fingerprint: "wrong",
      measuredAt: Date.now(),
      order: ["groq"] as const,
      ms: {}
    };
    expect(orderCandidatesFromStored(candidates, stored)).toBeNull();
  });
});
