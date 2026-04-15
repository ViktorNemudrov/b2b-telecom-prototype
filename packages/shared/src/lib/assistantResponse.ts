import { getDemoNavigationIntent, standaloneCalls, type ChatMessage, type InvoiceItem } from "./mockData";
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
      "Не могу подтвердить корректный ответ по вашему запросу на текущих данных. Уточните вопрос или выберите рабочий сценарий: счета, звонки, обращения.",
    suggested: ["Счета за март", "Звонки за неделю", "Активные обращения"]
  };
}

function hasAny(clean: string, compact: string, samples: string[]) {
  return samples.some((s) => clean.includes(s) || compact.includes(s.replace(/\s+/g, "")));
}

function normalizePrompt(prompt: string) {
  const clean = prompt
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
      text: "Вижу нецензурную лексику. Давайте продолжим по-деловому: счета, звонки, обращения или аналитика.",
      suggested: ["Счета", "Звонки", "Обращения"]
    };
  }

  const asksCapabilities = hasAny(clean, compact, [...SPECIAL_MOCK_INTENTS.capabilities]);
  if (asksCapabilities) {
    return {
      text:
        "Сейчас в приложении я умею:\n" +
        "- Показывать счета по месяцам, статусы и суммы\n" +
        "- Сравнивать месяцы, считать разницу, доли и динамику\n" +
        "- Подсказывать по неоплаченным счетам и оплате\n" +
        "- Показывать пропущенные звонки и открывать карточки звонков\n" +
        "- Запускать недельные сводки и рекомендации\n" +
        "- Работать с обращениями и быстрыми действиями\n" +
        "- Делать простые расчеты и конвертацию единиц\n" +
        "- Выгружать журнал диалога\n\n" +
        "Это специальный демо-ответ о возможностях ассистента.",
      suggested: ["Счета за февраль", "Звонки за неделю", "Мои обращения"]
    };
  }

  const hasGreeting = hasAny(clean, compact, [...SPECIAL_MOCK_INTENTS.greeting]);
  if (hasGreeting) {
    return { text: "И вам здравствуйте, желаю вам хорошего дня" };
  }

  const asksHowAreYou = hasAny(clean, compact, [...SPECIAL_MOCK_INTENTS.smallTalkHowAreYou]);
  if (asksHowAreYou) {
    return { text: "Работаю в штатном режиме. Могу помочь по счетам, звонкам, обращениям или аналитике." };
  }

  return null;
}

export function resolveDeterministicResponse(prompt: string, runtimeInvoices: InvoiceItem[]): AssistantPayload | null {
  const { clean, compact } = normalizePrompt(prompt);
  const monthDetected = parseMonth(clean, compact);

  const asksUnpaid = hasAny(clean, compact, ["покажи неоплаченные", "неоплаченные счета", "счета в статусе неоплачен", "долги по счетам"]);
  if (asksUnpaid) {
    return {
      text: "Показываю неоплаченные счета в чате.",
      widget: "invoices-unpaid-inline",
      suggested: ["Оплатить по QR", "Сравнить с прошлым месяцем", "Открыть список счетов"]
    };
  }

  const asksInvoicesDomain = hasAny(clean, compact, ["счета", "счет", "счёт", "оплата", "неоплаченные", "долг"]);
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

  const asksCallsDomain = hasAny(clean, compact, ["звонки", "звонок", "пропущенные", "пропущенный", "перезвон", "журнал звонков", "телефон"]);
  if (asksCallsDomain) {
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

  const asksAppealsDomain = hasAny(clean, compact, ["обращения", "обращение", "тикет", "заявка"]);
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

  const analytics = resolveAnalyticsResponse(prompt, runtimeInvoices, standaloneCalls);
  if (analytics) return analytics;

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

  const asksCalculator = hasAny(clean, compact, ["сколько будет", "посчитай", "вычисли", "калькулятор", "плюс", "минус", "умножить", "разделить"]);
  if (asksCalculator) {
    const mathExpr = clean.match(/([0-9]+(?:[.,][0-9]+)?)\s*([+\-*/xх×])\s*([0-9]+(?:[.,][0-9]+)?)/);
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

  return null;
}
