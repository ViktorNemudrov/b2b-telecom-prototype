import { describe, expect, it } from "vitest";
import { followUpQuestionsWeekly, invoicesJanFebApr2026, invoicesMarch2026, quickPrompts, recentQueryChips } from "./mockData";
import { resolveDeterministicResponse, resolveSpecialMockResponse } from "./assistantResponse";

const runtimeInvoices = [...invoicesMarch2026, ...invoicesJanFebApr2026];

describe("chat built-in prompts coverage", () => {
  it("routes all built-in chips/prompts without live fallback", () => {
    const prompts = [...recentQueryChips, ...followUpQuestionsWeekly, ...quickPrompts];

    for (const prompt of prompts) {
      const special = resolveSpecialMockResponse(prompt);
      const deterministic = resolveDeterministicResponse(prompt, runtimeInvoices);
      expect(
        Boolean(special || deterministic),
        `built-in prompt should be handled without live: "${prompt}"`
      ).toBe(true);
    }
  });
});
