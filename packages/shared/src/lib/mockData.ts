export type ChatRole = "user" | "ai";

export type ChatAction =
  | {
      type: "cta";
      title: string;
      subtitle?: string;
      ctaLabel: string;
      intent: "start-campaign" | "pay-balance" | "generate-report";
    };

export type ChatWidget =
  | "weekly-stats"
  | "weekly-stats-expanded"
  | "invoices-march"
  | "appeals-summary";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string; // ISO
  actions?: ChatAction[];
  suggested?: string[];
  widget?: ChatWidget;
};

export type CallItem = {
  id: string;
  time: string;
  phone: string;
  missed: boolean;
  summary: string;
  /** Короткое название для списков (например «Доставка офисной техники») */
  title?: string;
  companyHint?: string;
  transcript: string;
  recordingUrl?: string;
  talkBullets?: string[];
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

export type InvoiceStatus = "pay" | "pending" | "paid";

export type InvoiceItem = {
  id: string;
  amountRub: number;
  dueLabel: string;
  meta: string;
  status: InvoiceStatus;
  periodLabel: string;
};

export type AppealStatus = "active" | "done" | "rejected";

export type AppealItem = {
  id: string;
  title: string;
  status: AppealStatus;
  badgeLabel: string;
  category: string;
  dateLabel: string;
};

export const userProfile = {
  /** Имя для приветствия */
  firstName: "Владислав",
  /** Полное наименование в шапке */
  legalName: "ИП Балашов Владислав"
};

/** Последние запросы — чипсы над поиском (ТЗ). */
export const recentQueryChips = [
  "Обращения",
  "Мои сервисы",
  "Секретарь",
  "Мои счета",
  "Счета за март 2026",
  "звонки за неделю"
] as const;

/** Варианты текста для summary-виджета (макет саммара). */
export const summaryWidgetVariants = [
  {
    title: "Доставка офисной техники",
    subtitle: "Нужно подтвердить окно доставки и контакт получателя.",
    cta: "Открыть детали"
  },
  {
    title: "Флорист",
    subtitle: "Уточнение заказа и сроков — ожидает ответа.",
    cta: "Перезвонить"
  },
  {
    title: "ООО «Технологии»",
    subtitle: "Секретарь зафиксировал запрос по оплате.",
    cta: "Смотреть запись"
  }
] as const;

export const quickPrompts = ["Счета за март", "Запусти рассылку", "Сводка дня"] as const;

export const chatHistoryPresets: {
  id: string;
  title: string;
  preview: string;
  messages: ChatMessage[];
}[] = [
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

const transcriptDelivery =
  "Клиент: Добрый день! У нас на сегодня к вам доставка на два часа, примите курьера?\n\n" +
  "Вы: Добрый день! Да, конечно!\n\n" +
  "Клиент: Спасибо, я буду у вас примерно через 30 минут, скажите, есть ли у вас грузовой лифт, потому что коробки довольно тяжёлые?\n\n" +
  "Вы: Да, грузовой лифт есть, заезжайте со двора — там шлагбаум, я предупрежу охрану, чтобы вас пропустили.\n\n" +
  "Клиент: Отлично, а кто будет принимать груз — мне нужны ФИО и доверенность от организации?\n\n" +
  "Вы: Принимать буду я, Козлов Андрей Викторович, доверенность и печать у меня на руках, всё подготовлено.\n\n" +
  "Клиент: Понял, скоро буду!";

/** Единый мок звонков для AI и Classic (сквозная расшифровка). */
export const standaloneCalls: CallItem[] = [
  {
    id: "c1",
    time: "16:02",
    phone: "+7 (906) 062-60-26",
    missed: true,
    title: "Доставка офисной техники",
    summary: "Доставка офисной техники. Подтверждение времени и получателя.",
    transcript: transcriptDelivery,
    recordingUrl: "/greeting.wav",
    talkBullets: [
      "Доставка офисной техники, план на 14:00",
      "Ориентировочно прибытие через 30 минут",
      "Получатель: Козлов Андрей Викторович, доверенность есть"
    ]
  },
  {
    id: "c2",
    time: "16:02",
    phone: "+7 (946) 525-00-24",
    missed: true,
    summary: "Короткий контакт, секретарь принял сообщение.",
    transcript: "Секретарь: Клиент оставил номер для перезвона по счёту.",
    recordingUrl: "/greeting.wav",
    talkBullets: ["Секретарь зафиксировал запрос", "Требуется перезвон менеджеру"]
  },
  {
    id: "c3",
    time: "14:15",
    phone: "+7 (906) 062-60-26",
    missed: true,
    title: "Поставщик канцелярии",
    summary: "Уточнение по заказу канцтоваров.",
    transcript: "Клиент: Нужен счёт на дополнительную партию.\n\nСекретарь: Передал менеджеру.",
    recordingUrl: "/greeting.wav",
    talkBullets: ["Запрос счёта на дополнительную партию", "Передано менеджеру"]
  },
  {
    id: "c4",
    time: "11:04",
    phone: "+7 (904) 023-53-21",
    missed: true,
    summary: "Входящий: уточнение по графику.",
    transcript: "Секретарь: Клиент спросил про график поставок.",
    recordingUrl: "/greeting.wav",
    talkBullets: ["Вопрос по графику поставок"]
  },
  {
    id: "c5",
    time: "09:02",
    phone: "+7 (903) 111-22-33",
    missed: true,
    title: "Вода офис",
    summary: "Заказ воды, уточнение адреса.",
    transcript: "Секретарь: Уточнили адрес и подъезд.",
    recordingUrl: "/greeting.wav",
    talkBullets: ["Уточнение адреса доставки воды"]
  },
  {
    id: "c6",
    time: "09:01",
    phone: "+7 (902) 444-55-66",
    missed: true,
    title: "Канцелярия",
    summary: "Мелкий заказ расходников.",
    transcript: "Секретарь: Оставили заявку на расходники.",
    recordingUrl: "/greeting.wav",
    talkBullets: ["Заявка на расходники"]
  }
];

export const allCallIds = standaloneCalls.map((c) => c.id);

export const weeklyCallStatsMock = {
  total: 126,
  incoming: 82,
  outgoing: 44,
  botIncoming: 57,
  botClosed: 41,
  botWaitingManager: 16,
  avgDuration: "2 минуты 40 секунд",
  peakNote: "пиковая активность была во вторник днём",
  storageDays: 60,
  chartLabel: "Динамика звонков 17.05 — 24.05"
};

export const followUpQuestionsWeekly = [
  "Список звонков",
  "Пропущенные звонки",
  "Причины пропусков звонков",
  "Статистика по времени суток",
  "Сравнение звонков с предыдущей неделей",
  "Средняя конвертация в лид",
  "Увеличить срок хранения звонков"
] as const;

export const invoicesMarch2026: InvoiceItem[] = [
  {
    id: "inv1",
    amountRub: 67423,
    dueLabel: "до 30.04.26",
    meta: "408—ГД558 от 31.03.26",
    status: "paid",
    periodLabel: "март 2026"
  },
  {
    id: "inv2",
    amountRub: 12800,
    dueLabel: "до 15.04.26",
    meta: "Счёт 12/03 от 10.03.26",
    status: "pending",
    periodLabel: "март 2026"
  },
  {
    id: "inv3",
    amountRub: 45200,
    dueLabel: "до 05.04.26",
    meta: "УПД 77 от 28.02.26",
    status: "pay",
    periodLabel: "март 2026"
  },
  {
    id: "inv4",
    amountRub: 3100,
    dueLabel: "до 22.04.26",
    meta: "Счёт 5 от 18.03.26",
    status: "paid",
    periodLabel: "март 2026"
  }
];

export const appealsMock: AppealItem[] = [
  {
    id: "a1",
    title: "Мне не могут дозвониться",
    status: "active",
    badgeLabel: "В работе",
    category: "Техподдержка",
    dateLabel: "22.11.26"
  },
  {
    id: "a2",
    title: "Интернет не работает",
    status: "active",
    badgeLabel: "В работе",
    category: "Финансы",
    dateLabel: "22.11.26"
  },
  {
    id: "a3",
    title: "Переоформление",
    status: "active",
    badgeLabel: "Ожидает подписания",
    category: "Прочие операции",
    dateLabel: "22.11.26"
  },
  {
    id: "a4",
    title: "Низкая скорость",
    status: "done",
    badgeLabel: "Выполнено",
    category: "Техподдержка",
    dateLabel: "10.10.26"
  },
  {
    id: "a5",
    title: "Ошибочный платёж",
    status: "rejected",
    badgeLabel: "Отклонено",
    category: "Финансы",
    dateLabel: "01.09.26"
  }
];

export const appealTopicOptions = [
  { title: "Интернет не работает", subtitle: "Техническая поддержка" },
  { title: "Мне не могут дозвониться", subtitle: "Техническая поддержка" },
  { title: "Ошибочный платёж", subtitle: "Финансы" },
  { title: "Интернет пропадает, медленно работает", subtitle: "Техническая поддержка" },
  { title: "Низкая скорость", subtitle: "Техническая поддержка" }
] as const;

export const feedItems: FeedItem[] = [
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

export function getCallById(callId: string): CallItem | undefined {
  const s = standaloneCalls.find((c) => c.id === callId);
  if (s) return s;
  for (const item of feedItems) {
    if (item.kind === "call" && item.call.id === callId) return item.call;
  }
  return undefined;
}

export const allInvoiceIds = invoicesMarch2026.map((i) => i.id);

export function getInvoiceById(id: string): InvoiceItem | undefined {
  return invoicesMarch2026.find((i) => i.id === id);
}

export function getTariffFromFeed(): TariffStats | null {
  const t = feedItems.find((i) => i.kind === "tariff");
  return t && t.kind === "tariff" ? t.stats : null;
}

export function getAppealsFiltered(filter: "all" | "done" | "rejected"): AppealItem[] {
  if (filter === "done") return appealsMock.filter((a) => a.status === "done");
  if (filter === "rejected") return appealsMock.filter((a) => a.status === "rejected");
  return appealsMock;
}
