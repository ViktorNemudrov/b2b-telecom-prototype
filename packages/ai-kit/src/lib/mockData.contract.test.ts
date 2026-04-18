import { describe, expect, it } from "vitest";
import { appealTopicOptions, subscriptionProductsMock } from "./mockData";

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
