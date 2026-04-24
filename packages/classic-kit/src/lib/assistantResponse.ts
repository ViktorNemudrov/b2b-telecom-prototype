import {
  getDemoNavigationIntent,
  recentHistoryQuickPrompts,
  recentQueryChips,
  subscriptionBalanceChatMock,
  subscriptionProductsMock,
  standaloneCalls,
  type ChatMessage,
  type InvoiceItem
} from "./mockData";
import { resolveAnalyticsResponse } from "./chatAnalytics";
import { containsProfanity } from "./profanity";

type AssistantPayload = Pick<ChatMessage, "text" | "widget" | "invoiceMonth" | "suggested" | "navigateTo" | "actions">;
const subscriptionProductsText = subscriptionProductsMock.map((item) => `- ${item}`).join("\n");

const invoicesSummarySuggested = [
  "Покажи неоплаченные",
  "Счета за март 2026",
  "Сравни с прошлым месяцем",
  "Доля неоплаченных счетов"
] as const;

function buildInvoicesSummaryPayload(_runtimeInvoices: InvoiceItem[], intro?: string): AssistantPayload {
  const text = intro ?? "";
  return {
    text,
    widget: "invoices-summary-inline",
    suggested: [...invoicesSummarySuggested]
  };
}

export const SPECIAL_MOCK_INTENTS = {
  profanity: ["нецензурная лексика"],
  capabilities: ["что ты умеешь", "что умеешь", "что ты можешь", "твои возможности", "что можешь"],
  creator: ["кто тебя создал", "кто твой создатель", "кто тебя сделал", "кто твой автор"],
  whoDoYouLove: ["кого ты любишь", "кого любишь", "ты кого любишь"],
  greeting: ["привет", "здравствуй", "здравствуйте", "добрый день", "доброго дня", "доброе утро", "добрый вечер", "хай"],
  smallTalkHowAreYou: ["как дела", "как ты", "как поживаешь", "как жизнь"]
} as const;

const invoiceTokens = ["счет", "счёт", "оплат", "долг", "invoice"];
const callTokens = ["звон", "пропущ", "перезвон", "call"];
const appealTokens = ["обращен", "тикет", "заявк", "appeal"];

function includesAny(source: string, samples: string[]) {
  return samples.some((s) => source.includes(s));
}

export function isLiveResponseReliable(prompt: string, response: string): boolean {
  const p = normalizePrompt(prompt).clean;
  const r = normalizePrompt(response).clean;
  if (!r || r.length < 8 || r.length > 900) return false;
  if (r.includes("lorem ipsum")) return false;

  const promptNeedsInvoiceDomain = includesAny(p, invoiceTokens);
  const promptNeedsCallDomain = includesAny(p, callTokens);
  const promptNeedsAppealDomain = includesAny(p, appealTokens);

  if (promptNeedsInvoiceDomain && !includesAny(r, invoiceTokens)) return false;
  if (promptNeedsCallDomain && !includesAny(r, callTokens)) return false;
  if (promptNeedsAppealDomain && !includesAny(r, appealTokens)) return false;

  return true;
}

/** Сообщение в чате и в ассистенте, когда ИИ недоступен (нет ключей, ошибка API, пустой ответ). */
export const DEMO_CHAT_NO_AI_MESSAGE = "В демо-версии ИИ не подключены.";

export function buildSafeLiveFallbackResponse(): AssistantPayload {
  return {
    text: DEMO_CHAT_NO_AI_MESSAGE,
    suggested: ["Счета за март", "Звонки за неделю", "Активные обращения"]
  };
}

/** Добавляется к тексту fallback, когда перепробованы все live-провайдеры с ключами. */
export const LIVE_CHAIN_ALL_FAILED_FOOTER =
  "\n\nПерепробованы все модели с ключами. Если в Dev раньше отключились провайдеры из‑за ошибок, откройте `/assistant?resetLive=1` в этой же вкладке. Прямые запросы из браузера к внешним API часто блокируются (CORS): оставьте прокси `/api/llm` и серверные ключи (`GROQ_API_KEY` и т.д.). Проверьте вкладку «Сеть» в инструментах разработчика.";

/** Когда в клиентской сборке нет ни одного `NEXT_PUBLIC_*` ключа — live-цикл не вызывается. */
export function buildNoLiveKeysFallbackResponse(): AssistantPayload {
  return {
    text: DEMO_CHAT_NO_AI_MESSAGE,
    suggested: ["Счета за март", "Звонки за неделю", "Активные обращения"]
  };
}

type SessionFacts = {
  name: string | null;
  likes: string[];
};

function extractSessionFacts(userUtterances: string[]): SessionFacts {
  let name: string | null = null;
  const likes: string[] = [];

  for (const raw of userUtterances) {
    const text = raw.trim();
    if (!text) continue;

    const nameMatch = text.match(/(?:меня\s+зовут|мо[её]\s+имя)\s+([а-яёa-z][а-яёa-z\-]{1,30})/i);
    if (nameMatch?.[1]) {
      const n = nameMatch[1];
      name = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
    }

    const likeMatch = text.match(/(?:я\s+люблю|мне\s+нрав(?:ится|ят))\s+([^.!?]+)/i);
    if (likeMatch?.[1]) {
      const value = likeMatch[1]
        .replace(/[«»"']/g, "")
        .trim()
        .toLowerCase();
      if (value && !likes.includes(value)) likes.push(value);
    }
  }

  return { name, likes };
}

export function resolveSessionMemoryResponse(prompt: string, userUtterances: string[]): AssistantPayload | null {
  const { clean, compact } = normalizePrompt(prompt);
  const asksName = hasAny(clean, compact, ["как меня зовут", "мое имя", "моё имя", "кто я"]);
  const asksLikes = hasAny(clean, compact, ["что я люблю", "что мне нравится", "мои предпочтения"]);

  if (!asksName && !asksLikes) return null;

  const facts = extractSessionFacts(userUtterances);
  const chunks: string[] = [];

  if (asksName) {
    chunks.push(facts.name ? `В этом диалоге вы представились как ${facts.name}.` : "В этом диалоге вы еще не называли имя.");
  }
  if (asksLikes) {
    chunks.push(facts.likes.length ? `Вы говорили, что вам нравится: ${facts.likes.join(", ")}.` : "В этом диалоге вы еще не описывали предпочтения.");
  }

  return { text: chunks.join(" ") };
}

function hasAny(clean: string, compact: string, samples: string[]) {
  return samples.some((s) => clean.includes(s) || compact.includes(s.replace(/\s+/g, "")));
}

function asksUnitsIntent(clean: string): boolean {
  if (/(^|\s)(переведи|конвертируй)(\s|$)/.test(clean)) return true;
  return /(^|\s)(км|метр|метра|метров|кг|килограмм|килограмма|килограммов|литр|литра|литров|минута|минуты|минут|час|часа|часы)\s+(в|во)\s+/.test(
    clean
  );
}

function mapEnLayoutToRu(input: string): string {
  const map: Record<string, string> = {
    q: "й",
    w: "ц",
    e: "у",
    r: "к",
    t: "е",
    y: "н",
    u: "г",
    i: "ш",
    o: "щ",
    p: "з",
    "[": "х",
    "]": "ъ",
    a: "ф",
    s: "ы",
    d: "в",
    f: "а",
    g: "п",
    h: "р",
    j: "о",
    k: "л",
    l: "д",
    ";": "ж",
    "'": "э",
    z: "я",
    x: "ч",
    c: "с",
    v: "м",
    b: "и",
    n: "т",
    m: "ь",
    ",": "б",
    ".": "ю",
    "`": "ё"
  };
  return input
    .split("")
    .map((ch) => map[ch.toLowerCase()] ?? ch)
    .join("");
}

function normalizePrompt(prompt: string) {
  const trimmed = prompt.trim();
  const hasRu = /[а-яё]/i.test(trimmed);
  const hasEn = /[a-z]/i.test(trimmed);
  const prepared = hasEn && !hasRu ? mapEnLayoutToRu(trimmed) : trimmed;
  const clean = prepared
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { clean, compact: clean.replace(/\s+/g, "") };
}

function parseMonth(clean: string, compact: string): "январь" | "февраль" | "март" | "апрель" | null {
  if (hasAny(clean, compact, ["январ"])) return "январь";
  if (hasAny(clean, compact, ["феврал"])) return "февраль";
  if (hasAny(clean, compact, ["март"])) return "март";
  if (hasAny(clean, compact, ["апрел"])) return "апрель";
  return null;
}

function asksSubscriptionBalanceIntent(clean: string, compact: string): boolean {
  if (hasAny(clean, compact, ["пополнить баланс", "баланс минут", "баланс пакета"])) return false;
  if (clean.includes("счет") || clean.includes("счёт")) return false;
  if (hasAny(clean, compact, ["мой баланс", "покажи мой баланс", "покажи баланс"])) return true;
  if (compact === "баланс" || compact === "мойбаланс") return true;
  return /(^|\s)баланс(\s|$)/.test(clean);
}

function asksMyNumbersIntent(clean: string, compact: string): boolean {
  return hasAny(clean, compact, [
    "мои номера",
    "какие у меня номера",
    "какие номера",
    "список номеров",
    "покажи номера",
    "покажи мои номера"
  ]);
}

export function resolveSpecialMockResponse(prompt: string): AssistantPayload | null {
  const { clean, compact } = normalizePrompt(prompt);
  if (containsProfanity(clean)) {
    return {
      text: "Вроде бы взрослый человек, предприниматель, а такой некультурный!",
      suggested: ["Счета", "Звонки", "Обращения"]
    };
  }

  const asksCapabilities = hasAny(clean, compact, [...SPECIAL_MOCK_INTENTS.capabilities]);
  if (asksCapabilities) {
    return {
      text:
        "Я знаю ваши продукты и помогаю управлять ими удобнее и эффективнее:\n" +
        "- быстро запускаю сценарии\n" +
        "- показываю аналитику и инсайты\n" +
        "- быстро нахожу нужные данные, счета, платежи, обращения\n" +
        "- подсказываю полезные функции, которые вы еще не используете\n" +
        "- предлагаю новые возможности, если они могут быть вам полезны",
      suggested: ["Мои продукты", "Инсайты", "Открытые обращения"]
    };
  }

  const hasGreeting = hasAny(clean, compact, [...SPECIAL_MOCK_INTENTS.greeting]);
  if (hasGreeting) {
    return { text: "И вам здравствуйте, желаю вам хорошего дня" };
  }

  const asksHowAreYou = hasAny(clean, compact, [...SPECIAL_MOCK_INTENTS.smallTalkHowAreYou]);
  if (asksHowAreYou) {
    return { text: "Все хорошо, работаю на благо B2B в Билайне." };
  }

  const asksCreator = hasAny(clean, compact, [...SPECIAL_MOCK_INTENTS.creator]);
  if (asksCreator) {
    return { text: "Меня создал легендарный Виктор Немудров - архитектор, который превращает идеи в продуктовый космос." };
  }

  const asksWhoDoYouLove = hasAny(clean, compact, [...SPECIAL_MOCK_INTENTS.whoDoYouLove]);
  if (asksWhoDoYouLove) {
    return { text: "Тебя" };
  }

  return null;
}

export function resolveDeterministicResponse(prompt: string, runtimeInvoices: InvoiceItem[]): AssistantPayload | null {
  const rawLower = prompt.toLowerCase();
  const { clean, compact } = normalizePrompt(prompt);
  const monthDetected = parseMonth(clean, compact);
  const quickPromptNormalized = new Set(
    [...recentQueryChips, ...recentHistoryQuickPrompts].map((item) => normalizePrompt(item).clean)
  );

  if (asksMyNumbersIntent(clean, compact)) {
    return {
      text: "",
      widget: "my-numbers-inline",
      suggested: ["Купить номер", "Сменить тариф"]
    };
  }
  if (asksSubscriptionBalanceIntent(clean, compact)) {
    return {
      text: "",
      widget: "subscription-balance-inline",
      suggested: ["Продлить сейчас", "Состав Подписки"]
    };
  }

  if (quickPromptNormalized.has(clean)) {
    if (hasAny(clean, compact, ["мои сервисы", "мои продукты"])) {
      return {
        text:
          "По сервисам могу показать активные пакеты и состав подписки.\n\n" +
          "Ваши подключенные продукты:\n" +
          subscriptionProductsText,
        suggested: ["Изменить настройки секретаря", "Настроить запись звонков", "Инсайты"]
      };
    }
    if (hasAny(clean, compact, ["обращения", "открытые обращения"])) {
      return {
        text: "",
        widget: "appeals-summary",
        suggested: ["Создать обращение", "Список обращений", "Выполненные", "Отклонённые"]
      };
    }
    if (hasAny(clean, compact, ["счета на оплату", "мои счета"])) {
      return buildInvoicesSummaryPayload(runtimeInvoices);
    }
    if (hasAny(clean, compact, ["создать платеж", "создать платёж"])) {
      return { text: "Сценарий создания платежей пока в разработке" };
    }
    if (hasAny(clean, compact, ["звонки за неделю", "сводка звонков", "недельный отчет", "статистика звонков за неделю", "статистика звонков"])) {
      return {
        text: "",
        widget: "weekly-stats",
        suggested: ["Пропущенные звонки", "Статистика по времени суток", "Кого перезвонить в первую очередь"]
      };
    }
    if (hasAny(clean, compact, ["звонки", "записи звонков", "записи разговоров"])) {
      return {
        text: "",
        widget: "missed-calls-inline",
        suggested: ["Список звонков", "Причины пропусков звонков", "Увеличить срок хранения звонков"]
      };
    }
  }

  // Analytics should win over generic domain branches, otherwise mixed prompts
  // like "разница между счетами в феврале и марте" are downgraded to month view.
  const analytics = resolveAnalyticsResponse(prompt, runtimeInvoices, standaloneCalls);
  if (analytics) return analytics;

  const asksWeeklyCallStatsInChat =
    hasAny(clean, compact, ["звонки за неделю", "сводка звонков", "недельный отчет", "статистика звонков за неделю", "статистика звонков"]);
  if (asksWeeklyCallStatsInChat && !hasAny(clean, compact, ["пропущенные звонки", "пропущенных звонков", "покажи пропущенные", "сколько пропущенных"])) {
    return {
      text: "",
      widget: "weekly-stats",
      suggested: ["Пропущенные звонки", "Статистика по времени суток", "Кого перезвонить в первую очередь"]
    };
  }

  const asksUnpaid = hasAny(clean, compact, ["покажи неоплаченные", "неоплаченные счета", "счета в статусе неоплачен", "долги по счетам"]);
  if (asksUnpaid) {
    return {
      text: "",
      widget: "invoices-unpaid-inline",
      suggested: ["Оплатить по QR", "Сравнить с прошлым месяцем", "Открыть список счетов"]
    };
  }

  const asksAssistantAdvice = hasAny(clean, compact, ["дай совет от ассистента", "совет от ассистента", "советы от ассистента"]);
  if (asksAssistantAdvice) {
    return {
      text:
        "Совет от ассистента: чтобы снизить потери лидов, сначала обработайте свежие пропущенные, затем закройте неоплаченные счета с ближайшим сроком.",
      suggested: ["Пропущенные звонки", "Покажи неоплаченные", "Как оптимизировать остаток пакета"]
    };
  }

  const asksOperator = hasAny(clean, compact, [
    "позови человека",
    "позови оператора",
    "соедини с оператором",
    "позвать оператора",
    "нужен человек"
  ]);
  if (asksOperator) {
    return {
      text: "Я в демо режиме и не могу звать людей, може позвонить Леониду Пальчикову и ему все рассказать."
    };
  }

  const asksServices = hasAny(clean, compact, ["мои сервисы", "сервисы", "услуги", "подключенные сервисы"]);
  if (asksServices) {
    return {
      text: "По сервисам могу показать активные пакеты, остатки и рекомендации по оптимизации расходов.",
      suggested: ["Остаток по тарифу", "Как оптимизировать остаток пакета", "Пополнить пакет минут"]
    };
  }

  const asksTopUpMinutes = hasAny(clean, compact, [
    "пополнить пакет минут",
    "пополнить минуты",
    "докупить минуты",
    "добавить минуты",
    "купить пакет минут"
  ]);
  if (asksTopUpMinutes) {
    return {
      text:
        "Можно пополнить пакет минут в два шага: 1) выбираете нужный объем (например +300 или +1000 минут), 2) подтверждаете оплату. " +
        "Могу открыть раздел счетов и оплаты для оформления или подсказать оптимальный пакет по вашей динамике звонков.",
      suggested: ["Открыть список счетов", "Как оптимизировать остаток пакета", "Покажи неоплаченные"]
    };
  }

  const asksProducts = hasAny(clean, compact, ["мои продукты", "покажи мои продукты", "какие продукты подключены", "мои подключения"]);
  const asksAiAssistantsAvailability = hasAny(clean, compact, [
    "вам доступны ии ассистенты",
    "доступны ии ассистенты",
    "какие ассистенты доступны"
  ]);
  if (asksAiAssistantsAvailability) {
    return {
      text:
        "Вам доступны\n" +
        "- нейросети\n" +
        "- ассистенты: SMM, Бухгалтер, Юрист\n" +
        "- помощники по созданию сайтов и презентаций"
    };
  }
  if (asksProducts) {
    return {
      text:
        "Ваши подключенные продукты:\n" +
        subscriptionProductsText,
      suggested: ["Изменить настройки секретаря", "Настроить запись звонков", "Инсайты"]
    };
  }

  const asksInsights = hasAny(clean, compact, ["инсайты", "покажи инсайты", "какие инсайты", "бизнес инсайты"]);
  if (asksInsights) {
    return {
      text:
        "Ключевые инсайты: 1) у 4 клиентов есть риск неоплаты, 2) есть пропущенные звонки, требующие приоритетного перезвона, 3) последняя рассылка по базе дала 14% отклика.",
      suggested: ["Открытые обращения", "Покажи неоплаченные", "Запустить смс рассылку"]
    };
  }

  const asksOpenAppeals = hasAny(clean, compact, ["открытые обращения", "покажи открытые обращения", "мои открытые обращения"]);
  if (asksOpenAppeals) {
    return {
      text: "",
      widget: "appeals-summary",
      suggested: ["Создать обращение", "Список обращений", "Выполненные", "Отклонённые"]
    };
  }

  const asksCreatePayment = hasAny(clean, compact, ["создать платеж", "создай платеж", "новый платеж", "сформировать платеж"]);
  if (asksCreatePayment) {
    return { text: "Сценарий создания платежей пока в разработке" };
  }

  const asksSmsCampaign = hasAny(clean, compact, [
    "запустить смс рассылку",
    "запусти смс рассылку",
    "запустить sms рассылку",
    "запусти sms рассылку",
    "запустить смс-рассылку",
    "запусти смс-рассылку",
    "запустить sms-рассылку",
    "запусти sms-рассылку",
    "смс рассылка",
    "sms рассылка",
    "сделай смс рассылку"
  ]);
  if (asksSmsCampaign) {
    return {
      text: "Подготовил черновик SMS-рассылки по сегменту клиентов с риском просадки активности.",
      actions: [
        {
          type: "cta",
          title: "Запустить SMS-рассылку",
          subtitle: "Сегмент: клиенты с низкой активностью",
          ctaLabel: "Запустить",
          intent: "start-campaign"
        }
      ],
      suggested: ["Посмотри сегмент", "Согласовать текст", "Открытые обращения"]
    };
  }

  const asksCallRecords = hasAny(clean, compact, ["записи звонков", "покажи записи звонков", "журнал записей", "записи разговоров"]);
  if (asksCallRecords) {
    return {
      text: "",
      widget: "missed-calls-inline",
      suggested: ["Список звонков", "Причины пропусков звонков", "Увеличить срок хранения звонков"]
    };
  }

  const asksSecretarySettings = hasAny(clean, compact, [
    "изменить настройки секретаря",
    "настроить секретаря",
    "поменять настройки секретаря",
    "настроить секретарь"
  ]);
  if (asksSecretarySettings) {
    return {
      text: "Сценарий изменения настроек секретаря пока в разработке. Могу показать ваши продукты или активные обращения."
    };
  }

  const asksCallRecordingSettings = hasAny(clean, compact, [
    "настроить запись звонков",
    "изменить запись звонков",
    "настройка записи разговоров",
    "настроить записи звонков"
  ]);
  if (asksCallRecordingSettings) {
    return {
      text: "Сценарий настройки записи звонков пока в разработке. Могу помочь с текущими записями и аналитикой звонков."
    };
  }

  const asksDailySummary = hasAny(clean, compact, ["сводка дня", "дневная сводка", "итоги дня"]);
  if (asksDailySummary) {
    return {
      text:
        "Сводка дня: 15 пропущенных, 3 обработано, 4 клиента в риске по оплате. Могу открыть пропущенные, показать счета и подготовить отчет.",
      suggested: ["Пропущенные звонки", "Покажи неоплаченные", "Сформировать отчет"]
    };
  }

  const asksCampaign = hasAny(clean, compact, ["запусти рассылку", "запуск рассылки", "сделай рассылку"]);
  if (asksCampaign) {
    return {
      text: "Подготовил сценарий рассылки по клиентам с риском неоплаты. Могу открыть сегмент и запустить черновик.",
      actions: [
        {
          type: "cta",
          title: "Запустить рассылку",
          subtitle: "Сегмент: клиенты с риском неоплаты",
          ctaLabel: "Запустить",
          intent: "start-campaign"
        }
      ],
      suggested: ["Посмотри сегмент", "Согласовать текст", "Отложить на 13:00"]
    };
  }

  const asksWeeklyCallsFollowUp = hasAny(clean, compact, [
    "список звонков",
    "причины пропусков звонков",
    "статистика по времени суток",
    "сравнение звонков с предыдущей неделей",
    "средняя конвертация в лид"
  ]);
  if (asksWeeklyCallsFollowUp) {
    if (hasAny(clean, compact, ["список звонков"])) {
      return {
        text: "",
        widget: "weekly-stats-expanded",
        suggested: ["Пропущенные звонки", "Статистика по времени суток", "Кого перезвонить в первую очередь"]
      };
    }
    if (hasAny(clean, compact, ["причины пропусков звонков"])) {
      return {
        text:
          "Типичные причины пропусков: пиковая нагрузка в часы доставки, короткие окна для перезвона, иногда недоступность линии. Могу помочь расставить приоритеты.",
        suggested: ["Пропущенные звонки", "Звонки за неделю", "Увеличить срок хранения звонков"]
      };
    }
    if (hasAny(clean, compact, ["статистика по времени суток"])) {
      return {
        text: "По времени суток больше всего входящих в 11:00–15:00 и 16:00–18:00; в обед всплески короче.",
        suggested: ["Звонки за неделю", "Пропущенные звонки", "Сравнение звонков с предыдущей неделей"]
      };
    }
    if (hasAny(clean, compact, ["сравнение звонков с предыдущей неделей"])) {
      return {
        text: "К прошлой неделе: входящих +6%, исходящих −2%, длительность без резких изменений.",
        suggested: ["Звонки за неделю", "Пропущенные звонки", "Средняя конвертация в лид"]
      };
    }
    if (hasAny(clean, compact, ["средняя конвертация в лид"])) {
      return {
        text: "Конвертация в лид по текущей неделе: около 5% от первичных контактов, чуть выше среднего по сегменту.",
        suggested: ["Пропущенные звонки", "Покажи неоплаченные", "Как оптимизировать остаток пакета"]
      };
    }
    return {
      text: "",
      widget: "weekly-stats",
      suggested: ["Пропущенные звонки", "Статистика по времени суток", "Кого перезвонить в первую очередь"]
    };
  }

  const asksInvoicesDomain = hasAny(clean, compact, ["счета", "счет", "счёт", "оплата", "неоплаченные", "долг"]);
  const asksOpenInvoicesList = hasAny(clean, compact, ["открыть список счетов", "открой список счетов", "открыть счета", "открой счета"]);
  if (asksOpenInvoicesList) {
    return buildInvoicesSummaryPayload(runtimeInvoices);
  }
  if (asksInvoicesDomain && monthDetected) {
    return {
      text: "",
      widget: "invoices-month",
      invoiceMonth: monthDetected,
      suggested: ["Сравни с мартом", "Покажи неоплаченные", "Открыть список счетов"]
    };
  }
  if (asksInvoicesDomain) {
    return buildInvoicesSummaryPayload(runtimeInvoices);
  }

  const asksCallsDomain = hasAny(clean, compact, ["звонки", "звонок", "звонков", "пропущенные", "пропущенный", "перезвон", "журнал звонков", "телефон"]);
  if (asksCallsDomain) {
    if (hasAny(clean, compact, ["увеличить срок хранения звонков", "срок хранения звонков", "продлить хранение звонков", "хранение записей звонков"])) {
      return {
        text:
          "Готово: могу оформить запрос на увеличение срока хранения записей звонков с 60 до 180 дней. Подтвердить создание обращения?",
        suggested: ["Да, создать обращение", "Открыть обращения", "Какие условия хранения сейчас"]
      };
    }
    return {
      text: "",
      widget: "missed-calls-inline",
      suggested: ["Звонки за неделю", "Открыть журнал звонков", "Кто чаще звонит"]
    };
  }

  const asksCreateAppealConfirm = hasAny(clean, compact, ["да создать обращение", "да, создать обращение", "создать обращение"]);
  if (asksCreateAppealConfirm) {
    return { text: "Открываю создание обращения в разделе обращений.", navigateTo: "/appeals/?from=assistant" };
  }

  const asksAppealsDomain = hasAny(clean, compact, ["обращения", "обращение", "тикет", "заявка"]);
  const asksSecretary = hasAny(clean, compact, ["секретарь", "помощник секретарь", "виртуальный секретарь"]);
  if (asksSecretary) {
    return {
      text: "Открываю сценарий «Секретарь»: могу показать пропущенные, записи разговоров и подготовить черновик ответа клиенту.",
      suggested: ["Пропущенные звонки", "Показать записи звонков", "Сформировать ответ клиенту"]
    };
  }
  const asksActiveAppeals = hasAny(clean, compact, ["активные обращения", "активные заявки", "открой активные обращения"]);
  if (asksActiveAppeals) {
    return {
      text: "",
      widget: "appeals-summary",
      suggested: ["Создать обращение", "Список обращений", "Выполненные", "Отклонённые"]
    };
  }
  if (asksAppealsDomain) {
    return {
      text: "",
      widget: "appeals-summary",
      suggested: ["Создать обращение", "Список обращений", "Выполненные", "Отклонённые"]
    };
  }

  const asksTime = hasAny(clean, compact, ["сколько времени", "который час", "время сейчас", "текущее время"]);
  const asksDate = hasAny(clean, compact, ["какое сегодня число", "какая дата", "сегодняшняя дата", "какой сегодня день"]);
  if (asksTime || asksDate) {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const dateLabel = now.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long"
    });
    return { text: asksTime && asksDate ? `Сейчас ${timeLabel}, ${dateLabel}.` : asksTime ? `Сейчас ${timeLabel}.` : `Сегодня ${dateLabel}.` };
  }

  const mathExpr = rawLower.match(/([0-9]+(?:[.,][0-9]+)?)\s*([+\-*/xх×])\s*([0-9]+(?:[.,][0-9]+)?)/);
  const asksCalculator =
    hasAny(clean, compact, ["сколько будет", "посчитай", "вычисли", "калькулятор", "плюс", "минус", "умножить", "разделить"]) ||
    Boolean(mathExpr);
  if (asksCalculator) {
    if (!mathExpr) {
      return { text: "Могу посчитать простой пример. Напишите в формате: `1250 + 340`, `18 * 7`, `144 / 12`." };
    }
    const left = Number(mathExpr[1].replace(",", "."));
    const op = mathExpr[2];
    const right = Number(mathExpr[3].replace(",", "."));
    let result: number | null = null;
    if (op === "+") result = left + right;
    if (op === "-") result = left - right;
    if (op === "*" || op === "x" || op === "х" || op === "×") result = left * right;
    if (op === "/") result = right === 0 ? null : left / right;
    if (result === null) return { text: "Для деления на ноль результат не определен." };
    return { text: `Результат: ${Number.isInteger(result) ? result : result.toLocaleString("ru-RU", { maximumFractionDigits: 6 })}.` };
  }

  const asksUnits = asksUnitsIntent(clean);
  if (asksUnits) {
    const unitMatch = clean.match(
      /([0-9]+(?:[.,][0-9]+)?)\s*(км|м|см|мм|кг|г|мг|л|мл|час|часы|часа|мин|минута|минуты|сек|секунда|секунды)\s*(?:в|во)\s*(км|м|см|мм|кг|г|мг|л|мл|час|часы|часа|мин|минута|минуты|сек|секунда|секунды)/
    );
    if (!unitMatch) {
      return { text: "Готов помочь с конвертацией. Введите запрос в формате: `15 км в м`, `2.5 кг в г`, `3 часа в минуты`." };
    }
    const value = Number(unitMatch[1].replace(",", "."));
    const normalize = (u: string) => {
      if (u === "часы" || u === "часа") return "час";
      if (u === "минута" || u === "минуты") return "мин";
      if (u === "секунда" || u === "секунды") return "сек";
      return u;
    };
    const fromRaw = unitMatch[2];
    const toRaw = unitMatch[3];
    const from = normalize(fromRaw);
    const to = normalize(toRaw);
    const factors: Record<string, number> = { км: 1000, м: 1, см: 0.01, мм: 0.001, кг: 1000, г: 1, мг: 0.001, л: 1000, мл: 1, час: 3600, мин: 60, сек: 1 };
    const group = (u: string) => {
      if (["км", "м", "см", "мм"].includes(u)) return "length";
      if (["кг", "г", "мг"].includes(u)) return "mass";
      if (["л", "мл"].includes(u)) return "volume";
      if (["час", "мин", "сек"].includes(u)) return "time";
      return "other";
    };
    if (group(from) !== group(to) || group(from) === "other") {
      return { text: "Не могу конвертировать эти единицы между собой. Укажите совместимую пару (длина/масса/объем/время)." };
    }
    const result = (value * factors[from]) / factors[to];
    return { text: `${value.toLocaleString("ru-RU")} ${fromRaw} = ${result.toLocaleString("ru-RU", { maximumFractionDigits: 6 })} ${toRaw}.` };
  }

  const navIntent = getDemoNavigationIntent(prompt);
  if (navIntent) return { text: navIntent.ack, navigateTo: navIntent.to };

  // Safety net for quick-prompt UX: these phrases must never drop to live fallback.
  const looksLikeQuickPrompt = hasAny(clean, compact, [
    "мои сервисы",
    "мои продукты",
    "инсайты",
    "открытые обращения",
    "создать платеж",
    "создать платёж",
    "запустить смс рассылку",
    "записи звонков",
    "баланс",
    "мои номера",
    "изменить настройки секретаря",
    "настроить запись звонков"
  ]);
  if (looksLikeQuickPrompt) {
    return {
      text: "Сценарий распознан. Подскажите, какой вариант открыть: продукты, обращения, счета/оплату или звонки?",
      suggested: ["Мои продукты", "Открытые обращения", "Создать платеж", "Записи звонков"]
    };
  }

  return null;
}
