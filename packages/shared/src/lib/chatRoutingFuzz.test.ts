import { describe, expect, it } from "vitest";
import { invoicesJanFebApr2026, invoicesMarch2026 } from "./mockData";
import { resolveDeterministicResponse, resolveSpecialMockResponse } from "./assistantResponse";
import {
  deterministicScenarioCases,
  liveRequiredScenarioPrompts,
  specialScenarioCases
} from "./chatScenarioContracts";

const runtimeInvoices = [...invoicesMarch2026, ...invoicesJanFebApr2026];

/** Prompts where spacing/format changes break parsing (math, units). */
const fuzzSkip = new Set([
  "1250 + 340",
  "144 / 0",
  "15 км в м",
  "15 км в кг",
  "посчитай",
  "конвертируй"
]);

function buildFuzzVariants(base: string): string[] {
  const out = new Set<string>();
  out.add(base);
  out.add(`  ${base}  `);
  out.add(base.replace(/\s+/g, "  "));
  out.add(base.toLocaleUpperCase("ru-RU"));
  out.add(`${base} пожалуйста`);
  out.add(`ну ${base}`);
  return [...out];
}

describe("chat routing fuzz (variants)", () => {
  it("special scenarios stay routed for common phrasing variants", () => {
    for (const c of specialScenarioCases) {
      for (const variant of buildFuzzVariants(c.prompt)) {
        const special = resolveSpecialMockResponse(variant);
        expect(special, `special fuzz: "${variant}"`).not.toBeNull();
        expect(special?.text).toContain(c.contains);
      }
    }
  });

  it("deterministic scenarios stay routed for common phrasing variants", () => {
    for (const c of deterministicScenarioCases) {
      if (fuzzSkip.has(c.prompt)) continue;
      for (const variant of buildFuzzVariants(c.prompt)) {
        const special = resolveSpecialMockResponse(variant);
        expect(special, `deterministic fuzz should not hit special: "${variant}"`).toBeNull();

        const deterministic = resolveDeterministicResponse(variant, runtimeInvoices);
        expect(deterministic, `deterministic fuzz: "${variant}"`).not.toBeNull();
        expect(deterministic?.text).toContain(c.contains);
        if (c.expectWidget) expect(deterministic?.widget).toBe(c.expectWidget);
        if (c.expectNavigateTo) expect(deterministic?.navigateTo).toBe(c.expectNavigateTo);
      }
    }
  });

  it("live-required prompts stay non-deterministic for fuzz variants", () => {
    for (const prompt of liveRequiredScenarioPrompts) {
      for (const variant of buildFuzzVariants(prompt)) {
        expect(resolveSpecialMockResponse(variant)).toBeNull();
        expect(resolveDeterministicResponse(variant, runtimeInvoices)).toBeNull();
      }
    }
  });
});
