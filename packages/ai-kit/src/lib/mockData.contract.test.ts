import { describe, expect, it } from "vitest";
import {
  appealTopicOptions,
  getDemoNavigationIntent,
  myNumbersChatMock,
  subscriptionBalanceChatMock,
  subscriptionProductsMock
} from "./mockData";

describe("mock data contracts", () => {
  it("keeps subscription management products aligned with UX scenario", () => {
    expect(subscriptionProductsMock).toEqual([
      "Сотовая связь",
      "Запись разговоров",
      "Секретарь",
      "Этикетка",
      "ИИ-ассистенты",
      "Продвижение",
      "Прием платежей",
      "Конструктор сайтов"
    ]);
  });

  it("does not map appeals phrases to standalone appeals list navigation (summary stays in chat)", () => {
    expect(getDemoNavigationIntent("обращения")).toBeUndefined();
    expect(getDemoNavigationIntent("мои обращения")).toBeUndefined();
    expect(getDemoNavigationIntent("активные обращения")).toBeUndefined();
  });

  it("keeps chat subscription and numbers demo payloads stable", () => {
    expect(subscriptionBalanceChatMock.productName).toBe("Связь для бизнеса");
    expect(subscriptionBalanceChatMock.priceRub).toBe(1999);
    expect(myNumbersChatMock).toHaveLength(3);
    expect(myNumbersChatMock[0]?.phone).toMatch(/^\+79/);
  });

  it("contains the full baseline list of appeal topics used in UI", () => {
    const topics = appealTopicOptions.map((item) => item.title);
    expect(topics).toEqual(
      expect.arrayContaining([
        "Интернет не работает",
        "Мне не могут дозвониться",
        "Ошибочный платёж",
        "Интернет пропадает, медленно работает",
        "Низкая скорость"
      ])
    );
    expect(topics.length).toBeGreaterThanOrEqual(8);
  });
});
