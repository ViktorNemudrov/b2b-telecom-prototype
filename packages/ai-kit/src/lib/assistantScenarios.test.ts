import { describe, expect, it } from "vitest";
import { invoicesJanFebApr2026, invoicesMarch2026 } from "./mockData";
import { resolveDeterministicResponse, resolveSpecialMockResponse } from "./assistantResponse";
import {
  deterministicScenarioCases,
  liveRequiredScenarioPrompts,
  specialScenarioCases
} from "./chatScenarioContracts";

const runtimeInvoices = [...invoicesMarch2026, ...invoicesJanFebApr2026];

describe("assistant scenarios contract", () => {
  it("covers all known special-mock scenarios", () => {
    for (const c of specialScenarioCases) {
      const special = resolveSpecialMockResponse(c.prompt);
      expect(special, `special route should handle: "${c.prompt}"`).not.toBeNull();
      expect(special?.text).toContain(c.contains);
    }
  });

  it("covers all known deterministic scenarios", () => {
    for (const c of deterministicScenarioCases) {
      const special = resolveSpecialMockResponse(c.prompt);
      expect(special, `deterministic scenario should not be special: "${c.prompt}"`).toBeNull();

      const deterministic = resolveDeterministicResponse(c.prompt, runtimeInvoices);
      expect(deterministic, `deterministic route should handle: "${c.prompt}"`).not.toBeNull();
      if (c.expectEmptyText) {
        expect(deterministic?.text?.trim(), `empty text for: "${c.prompt}"`).toBe("");
      } else {
        expect(deterministic?.text).toContain(c.contains!);
      }
      if (c.expectWidget) expect(deterministic?.widget).toBe(c.expectWidget);
      if (c.expectNavigateTo) expect(deterministic?.navigateTo).toBe(c.expectNavigateTo);
    }
  });

  it("routes non-covered prompts to live-required path", () => {
    for (const prompt of liveRequiredScenarioPrompts) {
      const special = resolveSpecialMockResponse(prompt);
      const deterministic = resolveDeterministicResponse(prompt, runtimeInvoices);
      expect(special, `live-required should not be special: "${prompt}"`).toBeNull();
      expect(deterministic, `live-required should not be deterministic: "${prompt}"`).toBeNull();
    }
  });
});
