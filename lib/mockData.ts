export type ChatRole = "user" | "ai";

export type ChatAction =
  | { type: "cta"; title: string; subtitle?: string; ctaLabel: string; intent: "start-campaign" | "pay-balance" | "generate-report" };

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string; // ISO
  actions?: ChatAction[];
  suggested?: string[];
};

export type CallItem = {
  id: string;
  time: string; // "09:45"
  phone: string;
  missed: boolean;
  summary: string;
  companyHint?: string;
  transcript: string;
  recordingUrl?: string;
};

export type TariffStats = {
  gbUsed: number;
  gbTotal: number;
  minutesUsed: number;
  minutesTotal: number;
  smsUsed: number;
  smsTotal: number;
};

export type FeedItem =
  | { id: string; kind: "call"; call: CallItem }
  | { id: string; kind: "tariff"; stats: TariffStats }
  | { id: string; kind: "alert"; title: string; description: string; cta: string }
  | { id: string; kind: "summary"; title: string; description: string }
  | { id: string; kind: "tool"; title: string; description: string; cta: string };

export const userProfile = {
  name: "Виктор"
};

export const quickPrompts = ["Счета за март", "Запусти рассылку", "Сводка дня"] as const;

export const chatHistoryPresets: { id: string; title: string; preview: string; messages: ChatMessage[] }[] = [
  {
    id: "h1",
    title: "Сводка дня",
    preview: "15 пропущенных, 3 обработано…",
    messages: [
      {
        id: "m1",
        role: "user",
        text: "Сводка дня",
        createdAt: "2026-04-14T08:10:00.000Z"
      },
      {
        id: "m2",
        role: "ai",
        text:
          "Кратко по сегодняшнему утру:\n\n- Пропущенных: 15\n- Обработано: 3\n- Риск: 4 клиента по оплате\n\nМогу сформировать отчет или предложить сценарий перезвона.",
        createdAt: "2026-04-14T08:10:08.000Z",
        suggested: ["Сформируй отчет", "Покажи пропущенные", "Сценарий перезвона"]
      }
    ]
  },
  {
    id: "h2",
    title: "Запуск рассылки",
    preview: "Почему: звонки -30%…",
    messages: [
      {
        id: "m3",
        role: "user",
        text: "Запусти рассылку",
        createdAt: "2026-04-14T09:01:00.000Z"
      },
      {
        id: "m4",
        role: "ai",
        text:
          "Вижу падение активности звонков на 30% vs вчера.\n\nРекомендация: запустить короткую рассылку по сегменту «оплата/баланс» (≈ 312 контактов).",
        createdAt: "2026-04-14T09:01:06.000Z",
        actions: [
          {
            type: "cta",
            title: "Запустить рассылку",
            subtitle: "Почему: звонки -30% (утро vs вчера)",
            ctaLabel: "Запустить",
            intent: "start-campaign"
          }
        ],
        suggested: ["Посмотри сегмент", "Согласовать текст", "Отложить на 13:00"]
      }
    ]
  }
];

export const defaultChat: ChatMessage[] = [];

export const feedDateLabel = "Сегодня, 14 апреля 2026";

export const feedItems: FeedItem[] = [
  {
    id: "f1",
    kind: "call",
    call: {
      id: "c1",
      time: "09:45",
      phone: "+7 (999) 123-45-67",
      missed: true,
      summary: "Клиент по оплате. Просили счет и сроки.",
      companyHint: "В профиле: «Компания вместо номера»",
      transcript:
        "Клиент: Добрый день. Уточните, пожалуйста, по счету за март — не проходит оплата.\n\nОператор: Проверяю. Вижу отклонение по реквизитам. Могу продублировать счет и подсказать корректный шаблон платежа.\n\nКлиент: Да, пришлите на почту и скажите срок зачисления.\n\nОператор: Обычно 1–2 рабочих дня. Я отправлю обновленный счет прямо сейчас.",
      recordingUrl: "/greeting.wav"
    }
  },
  {
    id: "f2",
    kind: "tariff",
    stats: {
      gbUsed: 25,
      gbTotal: 100,
      minutesUsed: 15,
      minutesTotal: 500,
      smsUsed: 500,
      smsTotal: 1000
    }
  },
  {
    id: "f3",
    kind: "alert",
    title: "Баланс низкий",
    description: "Осталось ~ 1 240 ₽. Рекомендуем пополнить, чтобы не было ограничений.",
    cta: "Пополнить"
  },
  {
    id: "f4",
    kind: "summary",
    title: "Сводка дня",
    description: "15 пропущенных, 3 обработано. 4 клиента в риске по оплате."
  },
  {
    id: "f5",
    kind: "tool",
    title: "AI инструменты",
    description: "Сформировать ежедневный отчет для руководителя (PDF/Email).",
    cta: "Генерировать отчет"
  }
];

