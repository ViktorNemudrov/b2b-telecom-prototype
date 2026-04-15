import { describe, expect, it } from "vitest";
import { invoicesMarch2026 } from "./mockData";
import {
  buildSafeLiveFallbackResponse,
  isLiveResponseReliable,
  resolveDeterministicResponse,
  resolveSpecialMockResponse,
  SPECIAL_MOCK_INTENTS
} from "./assistantResponse";

describe("assistantResponse routing", () => {
  it("keeps explicit special mock intents list", () => {
    expect(SPECIAL_MOCK_INTENTS).toMatchInlineSnapshot(`
      {
        "capabilities": [
          "что ты умеешь",
          "что умеешь",
          "что ты можешь",
          "твои возможности",
          "что можешь",
        ],
        "greeting": [
          "привет",
          "здравствуй",
          "здравствуйте",
          "добрый день",
          "доброго дня",
          "доброе утро",
          "добрый вечер",
          "хай",
        ],
        "profanity": [
          "нецензурная лексика",
        ],
        "smallTalkHowAreYou": [
          "как дела",
          "как ты",
          "как поживаешь",
          "как жизнь",
        ],
      }
    `);
  });

  it("routes profanity to special mock", () => {
    const res = resolveSpecialMockResponse("ты чмо");
    expect(res).not.toBeNull();
    expect(res?.text).toContain("нецензурную лексику");
  });

  it("routes capabilities to special mock", () => {
    const res = resolveSpecialMockResponse("что ты умеешь");
    expect(res).not.toBeNull();
    expect(res?.text).toContain("специальный демо-ответ");
  });

  it("routes greeting to special mock", () => {
    const res = resolveSpecialMockResponse("привет");
    expect(res).not.toBeNull();
    expect(res?.text).toContain("здравствуйте");
  });

  it("routes how-are-you to special mock", () => {
    const res = resolveSpecialMockResponse("как дела?");
    expect(res).not.toBeNull();
    expect(res?.text).toContain("Работаю");
  });

  it("does not treat invoice request as special mock", () => {
    const res = resolveSpecialMockResponse("счета за март");
    expect(res).toBeNull();
  });

  it("returns deterministic month invoice widget", () => {
    const res = resolveDeterministicResponse("покажи счета за март", invoicesMarch2026);
    expect(res?.widget).toBe("invoices-month");
    expect(res?.invoiceMonth).toBe("март");
  });

  it("returns deterministic calls widget", () => {
    const res = resolveDeterministicResponse("сколько пропущенных звонков", invoicesMarch2026);
    expect(res?.widget).toBe("missed-calls-inline");
  });

  it("returns null for query that should go to live AI", () => {
    const res = resolveDeterministicResponse("какая погода в москве", invoicesMarch2026);
    expect(res).toBeNull();
  });

  it("does not keep how-are-you in deterministic path", () => {
    const res = resolveDeterministicResponse("как дела", invoicesMarch2026);
    expect(res).toBeNull();
  });

  it("accepts relevant live response for invoices", () => {
    expect(isLiveResponseReliable("покажи счета за март", "По счетам за март: 3 счета, 2 оплачены.")).toBe(true);
  });

  it("rejects irrelevant live response for invoice prompt", () => {
    expect(isLiveResponseReliable("покажи счета за март", "Расскажу про путешествия и музыку.")).toBe(false);
  });

  it("builds safe live fallback response", () => {
    const fallback = buildSafeLiveFallbackResponse();
    expect(fallback.text).toContain("Не могу подтвердить корректный ответ");
    expect(fallback.suggested?.length).toBeGreaterThanOrEqual(3);
  });
});
