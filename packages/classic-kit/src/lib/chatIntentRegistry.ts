import { containsProfanity } from "./profanity";

export type ChatIntentId =
  | "analytics_compare_months"
  | "analytics_unpaid_share"
  | "analytics_dynamics"
  | "analytics_top_invoices"
  | "analytics_invoice_month"
  | "analytics_missed_calls"
  | "time_date"
  | "weather"
  | "rates"
  | "news"
  | "calculator"
  | "unit_conversion"
  | "reminder"
  | "greeting"
  | "capabilities"
  | "profanity"
  | "weekly_calls";

type IntentMeta = {
  id: ChatIntentId;
  label: string;
  examples: string[];
  test: (q: string) => boolean;
};

const intents: IntentMeta[] = [
  {
    id: "analytics_compare_months",
    label: "Сравнение месяцев по счетам",
    examples: ["разница между суммой счетов в феврале и марте"],
    test: (q) => /(разниц|сравни|сравнение).*(феврал|март|январ|апрел).*(счет|счёт)/i.test(q)
  },
  {
    id: "analytics_unpaid_share",
    label: "Доля неоплаченных счетов",
    examples: ["какая доля неоплаченных счетов"],
    test: (q) => /(доля|процент).*(неоплачен|на оплату)/i.test(q)
  },
  {
    id: "analytics_dynamics",
    label: "Динамика счетов в процентах",
    examples: ["динамика счетов февраль к марту"],
    test: (q) => /(динамик|рост|изменени).*(счет|счёт)/i.test(q)
  },
  {
    id: "analytics_top_invoices",
    label: "Топ крупных счетов",
    examples: ["покажи топ-3 крупных счета"],
    test: (q) => /(топ|крупн).*(счет|счёт)/i.test(q)
  },
  {
    id: "analytics_invoice_month",
    label: "Счета за конкретный месяц",
    examples: ["счета за февраль"],
    test: (q) => /(счет|счёт).*(январ|феврал|март|апрел)/i.test(q)
  },
  {
    id: "analytics_missed_calls",
    label: "Аналитика по пропущенным звонкам",
    examples: ["сколько звонков я пропустил"],
    test: (q) => /(пропущ|пропуст).*(звон)/i.test(q)
  },
  {
    id: "time_date",
    label: "Дата и время",
    examples: ["сколько времени", "какая дата"],
    test: (q) => /(сколько времени|который час|какая дата|какое сегодня число)/i.test(q)
  },
  {
    id: "weather",
    label: "Погода",
    examples: ["какая погода в москве"],
    test: (q) => /(погода|температур|дожд|снег)/i.test(q)
  },
  {
    id: "rates",
    label: "Курс валют",
    examples: ["курс доллара"],
    test: (q) => /(курс валют|курс доллара|курс евро|usd|eur)/i.test(q)
  },
  {
    id: "news",
    label: "Новости",
    examples: ["последние новости"],
    test: (q) => /(новости|что нового|что в мире)/i.test(q)
  },
  {
    id: "calculator",
    label: "Калькулятор",
    examples: ["1250 + 340", "посчитай 18*7"],
    test: (q) => /(посчитай|вычисли|калькулятор|[0-9]\s*[+\-*/xх×]\s*[0-9])/i.test(q)
  },
  {
    id: "unit_conversion",
    label: "Перевод единиц",
    examples: ["15 км в м"],
    test: (q) => /(переведи|конвертируй|км в|кг в|час.*в.*мин)/i.test(q)
  },
  {
    id: "reminder",
    label: "Напоминания",
    examples: ["напомни оплатить счет"],
    test: (q) => /(напомни|напоминание|не забудь)/i.test(q)
  },
  {
    id: "weekly_calls",
    label: "Сводка звонков за неделю",
    examples: ["звонки за неделю"],
    test: (q) => /(звонки за неделю|сводка звонков|секретарь.*звон|звонк)/i.test(q)
  },
  {
    id: "greeting",
    label: "Приветствие",
    examples: ["привет"],
    test: (q) => /(привет|здравствуй|добрый день|доброе утро|добрый вечер)/i.test(q)
  },
  {
    id: "capabilities",
    label: "Что умеет ассистент",
    examples: ["что ты умеешь"],
    test: (q) => /(что ты умеешь|что умеешь|что ты можешь|твои возможности)/i.test(q)
  },
  {
    id: "profanity",
    label: "Токсичный/бранный запрос",
    examples: ["мат"],
    test: (q) => containsProfanity(q)
  }
];

export function detectIntent(prompt: string): ChatIntentId | null {
  const q = prompt.toLowerCase();
  const found = intents.find((i) => i.test(q));
  return found?.id ?? null;
}

export function listIntentCapabilities(): Array<{ id: ChatIntentId; label: string; examples: string[] }> {
  return intents.map((i) => ({ id: i.id, label: i.label, examples: i.examples }));
}
