import { describe, expect, it } from "vitest";
import { invoicesMarch2026 } from "./mockData";
import {
  buildNoLiveKeysFallbackResponse,
  buildSafeLiveFallbackResponse,
  isLiveResponseReliable,
  resolveDeterministicResponse,
  resolveSessionMemoryResponse,
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
        "creator": [
          "кто тебя создал",
          "кто твой создатель",
          "кто тебя сделал",
          "кто твой автор",
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
        "whoDoYouLove": [
          "кого ты любишь",
          "кого любишь",
          "ты кого любишь",
        ],
      }
    `);
  });

  it("routes profanity to special mock", () => {
    const res = resolveSpecialMockResponse("ты чмо");
    expect(res).not.toBeNull();
    expect(res?.text).toContain("Вроде бы взрослый человек");
  });

  it("routes capabilities to special mock", () => {
    const res = resolveSpecialMockResponse("что ты умеешь");
    expect(res).not.toBeNull();
    expect(res?.text).toContain("Я знаю ваши продукты");
  });

  it("routes greeting to special mock", () => {
    const res = resolveSpecialMockResponse("привет");
    expect(res).not.toBeNull();
    expect(res?.text).toContain("здравствуйте");
  });

  it("routes greeting typed in wrong keyboard layout", () => {
    const res = resolveSpecialMockResponse("Ghbdtn");
    expect(res).not.toBeNull();
    expect(res?.text).toContain("здравствуйте");
  });

  it("routes how-are-you to special mock", () => {
    const res = resolveSpecialMockResponse("как дела?");
    expect(res).not.toBeNull();
    expect(res?.text).toContain("Все хорошо, работаю на благо B2B в Билайне.");
  });

  it("routes creator question to special mock", () => {
    const res = resolveSpecialMockResponse("кто твой создатель?");
    expect(res).not.toBeNull();
    expect(res?.text).toContain("Виктор Немудров");
  });

  it("routes love question to special mock", () => {
    const res = resolveSpecialMockResponse("Кого ты любишь?");
    expect(res).not.toBeNull();
    expect(res?.text).toBe("Тебя");
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

  it("routes secretary prompt to deterministic path", () => {
    const res = resolveDeterministicResponse("Секретарь", invoicesMarch2026);
    expect(res).not.toBeNull();
    expect(res?.text).toContain("сценарий «Секретарь»");
  });

  it("routes call storage prompt to deterministic path", () => {
    const res = resolveDeterministicResponse("Увеличить срок хранения звонков", invoicesMarch2026);
    expect(res).not.toBeNull();
    expect(res?.text).toContain("увеличение срока хранения");
  });

  it("routes weekly calls prompts to dashboard", () => {
    const res = resolveDeterministicResponse("звонки за неделю", invoicesMarch2026);
    expect(res).not.toBeNull();
    expect(res?.navigateTo).toBe("/home/");
  });

  it("routes explicit weekly call statistics prompt to dashboard", () => {
    const res = resolveDeterministicResponse("Статистика звонков за неделю", invoicesMarch2026);
    expect(res).not.toBeNull();
    expect(res?.navigateTo).toBe("/home/");
  });

  it("routes assistant advice prompt without live", () => {
    const res = resolveDeterministicResponse("дай совет от ассистента", invoicesMarch2026);
    expect(res).not.toBeNull();
    expect(res?.text).toContain("Совет от ассистента:");
  });

  it("routes top up minutes prompt without live", () => {
    const res = resolveDeterministicResponse("Как пополнить пакет минут", invoicesMarch2026);
    expect(res).not.toBeNull();
    expect(res?.text).toContain("пополнить пакет минут");
  });

  it("routes open invoices list to navigation", () => {
    const res = resolveDeterministicResponse("открыть список счетов", invoicesMarch2026);
    expect(res?.navigateTo).toBe("/invoices/");
  });

  it("routes operator request to deterministic response", () => {
    const res = resolveDeterministicResponse("позови оператора", invoicesMarch2026);
    expect(res).not.toBeNull();
    expect(res?.text).toContain("Я в демо режиме и не могу звать людей");
  });

  it("routes new quick prompts without live fallback", () => {
    const insights = resolveDeterministicResponse("Инсайты", invoicesMarch2026);
    expect(insights?.text).toContain("Ключевые инсайты");

    const openAppeals = resolveDeterministicResponse("Открытые обращения", invoicesMarch2026);
    expect(openAppeals?.widget).toBe("appeals-summary");
    expect(openAppeals?.navigateTo).toBeUndefined();

    const createPayment = resolveDeterministicResponse("Создать платеж", invoicesMarch2026);
    expect(createPayment?.navigateTo).toBe("/invoices/");

    const smsCampaign = resolveDeterministicResponse("Запустить смс рассылку", invoicesMarch2026);
    expect(smsCampaign?.text).toContain("SMS-рассылки");

    const callRecords = resolveDeterministicResponse("Записи звонков", invoicesMarch2026);
    expect(callRecords?.widget).toBe("missed-calls-inline");
  });

  it("keeps sms hyphen variant deterministic", () => {
    const res = resolveDeterministicResponse("Запусти смс-рассылку", invoicesMarch2026);
    expect(res).not.toBeNull();
    expect(res?.text).toContain("SMS-рассылки");
  });

  it("never drops known quick prompt forms to live fallback", () => {
    const res = resolveDeterministicResponse("создать платёж", invoicesMarch2026);
    expect(res).not.toBeNull();
  });

  it("handles exact quick chips/history prompts deterministically", () => {
    expect(resolveDeterministicResponse("Мои сервисы", invoicesMarch2026)?.text).toContain("Ваши подключенные продукты");
    expect(resolveDeterministicResponse("Обращения", invoicesMarch2026)?.widget).toBe("appeals-summary");
    expect(resolveDeterministicResponse("Обращения", invoicesMarch2026)?.navigateTo).toBeUndefined();
    expect(resolveDeterministicResponse("Счета на оплату", invoicesMarch2026)?.navigateTo).toBe("/invoices/");
    expect(resolveDeterministicResponse("Записи звонков", invoicesMarch2026)?.widget).toBe("missed-calls-inline");
    expect(resolveDeterministicResponse("Баланс", invoicesMarch2026)?.widget).toBe("subscription-balance-inline");
    expect(resolveDeterministicResponse("Мои номера", invoicesMarch2026)?.widget).toBe("my-numbers-inline");
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
    expect(fallback.text).toContain("не удалось получить надежный live-ответ");
    expect(fallback.suggested?.length).toBeGreaterThanOrEqual(3);
  });

  it("builds no-live-keys fallback when NEXT_PUBLIC keys are absent from bundle", () => {
    const noKeys = buildNoLiveKeysFallbackResponse();
    expect(noKeys.text).toContain("нет ключей API");
    expect(noKeys.text).toContain("NEXT_PUBLIC");
    expect(noKeys.suggested?.length).toBeGreaterThanOrEqual(3);
  });

  it("answers from session memory without hardcoded query", () => {
    const res = resolveSessionMemoryResponse("Как меня зовут и что я люблю?", [
      "Меня зовут Анна. Я люблю кофе.",
      "Покажи счета за март"
    ]);
    expect(res).not.toBeNull();
    expect(res?.text).toContain("Анна");
    expect(res?.text).toContain("кофе");
  });
});
