import {
  getDemoNavigationIntent,
  recentHistoryQuickPrompts,
  recentQueryChips,
  standaloneCalls,
  type ChatMessage,
  type InvoiceItem
} from "./mockData";
import { resolveAnalyticsResponse } from "./chatAnalytics";
import { containsProfanity } from "./profanity";

type AssistantPayload = Pick<ChatMessage, "text" | "widget" | "invoiceMonth" | "suggested" | "navigateTo" | "actions">;

export const SPECIAL_MOCK_INTENTS = {
  profanity: ["нецензурная лексика"],
  capabilities: ["что ты умеешь", "что умеешь", "что ты можешь", "твои возможности", "что можешь"],
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

export function buildSafeLiveFallbackResponse(): AssistantPayload {
  return {
    text:
      "Сейчас не удалось получить надежный live-ответ. Попробуйте уточнить запрос или выберите быстрый сценарий: счета, звонки, обращения.",
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
        "- предлагаю новые возможности, если они могут быть вам полезны\n" +
        "- Показывать счета по месяцам, статусы и суммы\n" +
        "- Сравнивать месяцы, считать разницу, доли и динамику\n" +
        "- Подсказывать по неоплаченным счетам и оплате\n" +
        "- Показывать пропущенные звонки и открывать карточки звонков\n" +
        "- Запускать недельные сводки и рекомендации\n" +
        "- Работать с обращениями и быстрыми действиями\n" +
        "- Делать простые расчеты и конвертацию единиц\n" +
        "- Выгружать журнал диалога",
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

  return null;
}

export function resolveDeterministicResponse(prompt: string, runtimeInvoices: InvoiceItem[]): AssistantPayload | null {
  const rawLower = prompt.toLowerCase();
  const { clean, compact } = normalizePrompt(prompt);
  const monthDetected = parseMonth(clean, compact);
  const quickPromptNormalized = new Set(
    [...recentQueryChips, ...recentHistoryQuickPrompts].map((item) => normalizePrompt(item).clean)
  );

  if (quickPromptNormalized.has(clean)) {
    if (hasAny(clean, compact, ["мои сервисы", "мои продукты"])) {
      return {
        text:
          "Ваши подключенные продукты:\n" +
          "- Сотовая связь: 12 номеров, 4 номера с остатком минут < 20%\n" +
          "- Запись разговоров: хранение 60 дней, 18 новых записей за неделю\n" +
          "- Секретарь: настроен, режим работы Пн-Пт 09:00-19:00\n" +
          "- Этикетка: активна, тег «Приоритетный клиент»\n" +
          "- Продвижение: 3 рассылки за месяц, последняя с откликом 14%\n" +
          "- Прием платежей: 47 платежей за неделю, успешность 96%",
        suggested: ["Изменить настройки секретаря", "Настроить запись звонков", "Инсайты"]
      };
    }
    if (hasAny(clean, compact, ["обращения", "открытые обращения"])) {
      return { text: "Открываю раздел с активными обращениями.", navigateTo: "/appeals/" };
    }
    if (hasAny(clean, compact, ["счета на оплату", "мои счета", "создать платеж", "создать платёж", "баланс"])) {
      return { text: "Открываю счета и оплату: можно выбрать счет и провести платеж удобным способом.", navigateTo: "/invoices/" };
    }
    if (hasAny(clean, compact, ["звонки", "записи звонков", "записи разговоров"])) {
      return {
        text: "Показываю записи и сводку по звонкам прямо в чате.",
        widget: "missed-calls-inline",
        suggested: ["Список звонков", "Причины пропусков звонков", "Увеличить срок хранения звонков"]
      };
    }
  }

  // Analytics should win over generic domain branches, otherwise mixed prompts
  // like "разница между счетами в феврале и марте" are downgraded to month view.
  const analytics = resolveAnalyticsResponse(prompt, runtimeInvoices, standaloneCalls);
  if (analytics) return analytics;

  const asksUnpaid = hasAny(clean, compact, ["покажи неоплаченные", "неоплаченные счета", "счета в статусе неоплачен", "долги по счетам"]);
  if (asksUnpaid) {
    return {
      text: "Показываю неоплаченные счета в чате.",
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
  if (asksProducts) {
    return {
      text:
        "Ваши подключенные продукты:\n" +
        "- Сотовая связь: 12 номеров, 4 номера с остатком минут < 20%\n" +
        "- Запись разговоров: хранение 60 дней, 18 новых записей за неделю\n" +
        "- Секретарь: настроен, режим работы Пн-Пт 09:00-19:00\n" +
        "- Этикетка: активна, тег «Приоритетный клиент»\n" +
        "- Продвижение: 3 рассылки за месяц, последняя с откликом 14%\n" +
        "- Прием платежей: 47 платежей за неделю, успешность 96%",
      suggested: ["Изменить настройки секретаря", "Настроить запись звонков", "Инсайты"]
    };
  }

  const asksInsights = hasAny(clean, compact, ["инсайты", "покажи инсайты", "какие инсайты", "бизнес инсайты"]);
  if (asksInsights) {
    return {
      text:
        "Ключевые инсайты: 1) у 4 клиентов есть риск неоплаты, 2) по 6 пропущенным звонкам нужен приоритетный перезвон, 3) последняя рассылка по базе дала 14% отклика.",
      suggested: ["Открытые обращения", "Покажи неоплаченные", "Запустить смс рассылку"]
    };
  }

  const asksOpenAppeals = hasAny(clean, compact, ["открытые обращения", "покажи открытые обращения", "мои открытые обращения"]);
  if (asksOpenAppeals) {
    return { text: "Открываю раздел с активными обращениями.", navigateTo: "/appeals/" };
  }

  const asksCreatePayment = hasAny(clean, compact, ["создать платеж", "создай платеж", "новый платеж", "сформировать платеж"]);
  if (asksCreatePayment) {
    return {
      text: "Открываю счета и оплату: можно выбрать счет и провести платеж удобным способом.",
      navigateTo: "/invoices/"
    };
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
      text: "Показываю записи и сводку по звонкам прямо в чате.",
      widget: "missed-calls-inline",
      suggested: ["Список звонков", "Причины пропусков звонков", "Увеличить срок хранения звонков"]
    };
  }

  const asksBalance = hasAny(clean, compact, ["баланс", "мой баланс", "покажи баланс"]);
  if (asksBalance) {
    return {
      text: "Текущий баланс положительный. Открываю раздел счетов и оплат, чтобы посмотреть детали.",
      navigateTo: "/invoices/"
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
    return {
      text: "Показываю расширенную сводку звонков за неделю с детализацией по вашему вопросу.",
      widget: "weekly-stats-expanded",
      suggested: ["Пропущенные звонки", "Причины пропусков звонков", "Увеличить срок хранения звонков"]
    };
  }

  const asksInvoicesDomain = hasAny(clean, compact, ["счета", "счет", "счёт", "оплата", "неоплаченные", "долг"]);
  const asksOpenInvoicesList = hasAny(clean, compact, ["открыть список счетов", "открой список счетов", "открыть счета", "открой счета"]);
  if (asksOpenInvoicesList) {
    return { text: "Открываю полный список счетов.", navigateTo: "/invoices/" };
  }
  if (asksInvoicesDomain && monthDetected) {
    return {
      text: `Показываю счета за ${monthDetected} в чате.`,
      widget: "invoices-month",
      invoiceMonth: monthDetected,
      suggested: ["Сравни с мартом", "Покажи неоплаченные", "Открыть список счетов"]
    };
  }
  if (asksInvoicesDomain) {
    const unpaid = runtimeInvoices.filter((inv) => inv.status === "pay").length;
    return {
      text: `По счетам: всего ${runtimeInvoices.length}, неоплаченных ${unpaid}. Могу показать их в чате или открыть список счетов.`,
      suggested: ["Покажи неоплаченные", "Счета за февраль", "Открыть список счетов"]
    };
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
    if (hasAny(clean, compact, ["звонки за неделю", "сводка звонков", "недельный отчет"])) {
      return {
        text: "За неделю: 126 звонков, 6 пропущенных, средняя длительность 2:40. Показываю расширенную сводку и могу дать следующий шаг.",
        widget: "weekly-stats-expanded",
        suggested: ["Пропущенные звонки", "Статистика по времени суток", "Кого перезвонить в первую очередь"]
      };
    }
    const missed = standaloneCalls.filter((c) => c.missed).length;
    return {
      text: `По звонкам: всего ${standaloneCalls.length}, пропущенных ${missed}. Показываю детали прямо в чате.`,
      widget: "missed-calls-inline",
      suggested: ["Звонки за неделю", "Открыть журнал звонков", "Кто чаще звонит"]
    };
  }

  const asksCreateAppealConfirm = hasAny(clean, compact, ["да создать обращение", "да, создать обращение", "создать обращение"]);
  if (asksCreateAppealConfirm) {
    return { text: "Открываю создание обращения в разделе обращений.", navigateTo: "/appeals/" };
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
    return { text: "Открываю раздел с обращениями. Покажу активные и можно сразу продолжить диалог.", navigateTo: "/appeals/" };
  }
  if (asksAppealsDomain) {
    return {
      text: "По обращениям могу показать активные, выполненные и отклоненные. При необходимости открою раздел обращений.",
      suggested: ["Активные обращения", "Открыть обращения", "Создать обращение"]
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

  const asksUnits = hasAny(clean, compact, ["переведи", "конвертируй", "км в", "метр в", "кг в", "литр в", "минута в", "час в"]);
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
