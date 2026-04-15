"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Sparkles, X } from "lucide-react";
import { InvoicesMarchWidget } from "@shared/components/ai/InvoicesMarchWidget";
import { WeeklyStatsWidget } from "@shared/components/ai/WeeklyStatsWidget";
import { MissedCallSummaryCard } from "@shared/components/MissedCallSummaryCard";
import { ActionCard } from "@shared/components/ActionCard";
import { BottomInputBar } from "@shared/components/BottomInputBar";
import { ChatBubble } from "@shared/components/ChatBubble";
import { Card, CardContent } from "@shared/components/ui/card";
import { Modal } from "@shared/components/ui/modal";
import { cn } from "@shared/components/ui/cn";
import {
  chatHistoryPresets,
  defaultChat,
  getDemoNavigationIntent,
  recentQueryChips,
  userProfile,
  standaloneCalls,
  type ChatMessage,
  type InvoiceItem
} from "@shared/lib/mockData";
import { getLiveAiText, type LiveAiMessage } from "@shared/lib/liveAi";
import { resolveAnalyticsResponse } from "@shared/lib/chatAnalytics";
import { detectIntent, type ChatIntentId } from "@shared/lib/chatIntentRegistry";
import { containsProfanity } from "@shared/lib/profanity";
import { useRuntimeInvoices } from "@shared/lib/runtimeInvoices";
import { isMissedCallsSeen, markMissedCallsSeen } from "@shared/lib/runtimeFlags";

const sphereSrc = "/mockups/%D0%A8%D0%B0%D1%80.png";

function id() {
  return Math.random().toString(16).slice(2);
}

function nowIso() {
  return new Date().toISOString();
}

/** Разнообразные ответы без повторения одной и той же фразы (демо). */
function hashPick(prompt: string, modulo: number) {
  let h = 0;
  for (let i = 0; i < prompt.length; i++) h = (h * 31 + prompt.charCodeAt(i)) | 0;
  return Math.abs(h) % modulo;
}

function mockAiResponse(prompt: string, runtimeInvoices: InvoiceItem[]): ChatMessage {
  const p = prompt.toLowerCase();
  const clean = p
    .replace(/[^a-zа-яё0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const compact = clean.replace(/\s+/g, "");
  const hasAny = (samples: string[]) => samples.some((s) => clean.includes(s) || compact.includes(s.replace(/\s+/g, "")));

  const hasGreeting = hasAny([
    "привет",
    "здравствуй",
    "здравствуйте",
    "добрый день",
    "доброго дня",
    "доброе утро",
    "добрый вечер",
    "хай"
  ]);
  const asksHowAreYou = hasAny(["как дела", "как ты", "как поживаешь", "как жизнь"]);
  const asksCapabilities = hasAny(["что ты умеешь", "что умеешь", "что ты можешь", "твои возможности", "что можешь"]);
  const asksTime = hasAny(["сколько времени", "который час", "время сейчас", "текущее время"]);
  const asksDate = hasAny(["какое сегодня число", "какая дата", "сегодняшняя дата", "какой сегодня день"]);
  const asksWeather = hasAny(["погода", "дождь", "снег", "температура", "градус", "ветер"]);
  const asksRates = hasAny(["курс доллара", "курс евро", "курс валют", "доллар", "евро", "usd", "eur"]);
  const asksNews = hasAny(["новости", "что нового", "последние новости", "что в мире"]);
  const asksInvoices = hasAny(["счет", "счета", "счёт", "счёта"]);
  const monthDetected =
    hasAny(["январ"]) ? "январь" : hasAny(["феврал"]) ? "февраль" : hasAny(["март"]) ? "март" : hasAny(["апрел"]) ? "апрель" : null;
  const asksCalculator = hasAny([
    "сколько будет",
    "посчитай",
    "вычисли",
    "калькулятор",
    "плюс",
    "минус",
    "умножить",
    "разделить"
  ]);
  const asksUnits = hasAny([
    "переведи",
    "конвертируй",
    "км в",
    "метр в",
    "кг в",
    "литр в",
    "минута в",
    "час в"
  ]);
  const asksReminder = hasAny(["напомни", "напоминание", "поставь напоминание", "не забудь"]);
  const asksSecretary = hasAny(["секретарь", "помощник", "ассистент по звонкам"]);
  const asksCallsDomain = hasAny([
    "звонки",
    "звонок",
    "пропущенные",
    "пропущенный",
    "перезвон",
    "журнал звонков",
    "телефон"
  ]);
  const asksInvoicesDomain = hasAny(["счета", "счет", "счёт", "оплата", "неоплаченные", "долг"]);
  const asksAppealsDomain = hasAny(["обращения", "обращение", "тикет", "заявка"]);
  const hasProfanity = containsProfanity(clean);

  if (hasProfanity) {
    return {
      id: id(),
      role: "ai",
      text: "Вроде бы взрослый человек, предприниматель, а такой некультурный",
      createdAt: nowIso()
    };
  }

  const analytics = resolveAnalyticsResponse(prompt, runtimeInvoices, standaloneCalls);
  if (analytics) {
    return {
      id: id(),
      role: "ai",
      createdAt: nowIso(),
      ...analytics
    };
  }

  if (asksHowAreYou) {
    return {
      id: id(),
      role: "ai",
      text: "Дела у меня хорошо, вот работаю на благо В2В в Билайн",
      createdAt: nowIso()
    };
  }

  if (asksCapabilities) {
    return {
      id: id(),
      role: "ai",
      text:
        "Сейчас в приложении я умею:\n" +
        "- Показывать счета по месяцам, статусы и суммы\n" +
        "- Сравнивать месяцы, считать разницу, доли и динамику\n" +
        "- Подсказывать по неоплаченным счетам и оплате\n" +
        "- Показывать пропущенные звонки и открывать карточки звонков\n" +
        "- Запускать недельные сводки и рекомендации\n" +
        "- Работать с обращениями и быстрыми действиями\n" +
        "- Отвечать на базовые вопросы: время, дата, погода, курсы, новости\n" +
        "- Делать простые расчеты и конвертацию единиц\n" +
        "- Выгружать журнал диалога\n\n" +
        "Но помните, что я всего лишь демо образец, собранный без разработчиков на Витиной коленке.",
      createdAt: nowIso(),
      suggested: ["Счета за февраль", "Звонки за неделю", "Мои обращения"]
    };
  }

  if (asksSecretary && !asksCallsDomain && !asksInvoicesDomain && !asksAppealsDomain) {
    return {
      id: id(),
      role: "ai",
      text:
        "Секретарь готов. Что открыть: звонки, счета или обращения?\n\n" +
        "Могу сразу показать пропущенные в чате, открыть список счетов или перейти к обращениям.",
      createdAt: nowIso(),
      suggested: ["Звонки", "Счета", "Обращения"]
    };
  }

  if (asksInvoicesDomain && monthDetected) {
    return {
      id: id(),
      role: "ai",
      text: `Показываю счета за ${monthDetected} в чате.`,
      createdAt: nowIso(),
      widget: "invoices-month",
      invoiceMonth: monthDetected,
      suggested: ["Сравни с мартом", "Покажи неоплаченные", "Открыть список счетов"]
    };
  }

  if (asksInvoicesDomain) {
    const unpaid = runtimeInvoices.filter((inv) => inv.status === "pay").length;
    return {
      id: id(),
      role: "ai",
      text: `По счетам: всего ${runtimeInvoices.length}, неоплаченных ${unpaid}. Могу показать их в чате или открыть список счетов.`,
      createdAt: nowIso(),
      suggested: ["Покажи неоплаченные", "Счета за февраль", "Открыть список счетов"]
    };
  }

  if (asksCallsDomain) {
    if (hasAny(["звонки за неделю", "сводка звонков", "недельный отчет"])) {
      return {
        id: id(),
        role: "ai",
        text:
          "За неделю: 126 звонков, 6 пропущенных, средняя длительность 2:40. Показываю расширенную сводку и могу дать следующий шаг.",
        createdAt: nowIso(),
        widget: "weekly-stats-expanded",
        suggested: ["Пропущенные звонки", "Статистика по времени суток", "Кого перезвонить в первую очередь"]
      };
    }
    const missed = standaloneCalls.filter((c) => c.missed).length;
    return {
      id: id(),
      role: "ai",
      text: `По звонкам: всего ${standaloneCalls.length}, пропущенных ${missed}. Показываю детали прямо в чате.`,
      createdAt: nowIso(),
      widget: "missed-calls-inline",
      suggested: ["Звонки за неделю", "Открыть журнал звонков", "Кто чаще звонит"]
    };
  }

  if (asksAppealsDomain) {
    return {
      id: id(),
      role: "ai",
      text: "По обращениям могу показать активные, выполненные и отклоненные. При необходимости открою раздел обращений.",
      createdAt: nowIso(),
      suggested: ["Активные обращения", "Открыть обращения", "Создать обращение"]
    };
  }
  if (hasAny(["разница между суммой счетов", "разница между счетами", "разница феврал", "феврал и март"])) {
    return {
      id: id(),
      role: "ai",
      text: "Считаю разницу между суммами счетов за февраль и март...",
      createdAt: nowIso(),
      widget: "invoices-month",
      invoiceMonth: "февраль"
    };
  }

  if (hasAny(["сколько звонков я пропустил", "пропустил в прошлом месяце", "пропущенные за прошлый месяц"])) {
    const missed = standaloneCalls.filter((c) => c.missed).length;
    return {
      id: id(),
      role: "ai",
      text: `По текущим данным за прошлый месяц пропущено ${missed} звонков. Могу показать их в чате.`,
      createdAt: nowIso(),
      widget: "missed-calls-inline"
    };
  }

  if (hasAny(["пропущенные звонки в чате", "покажи пропущенные в чате", "пропущенные в чате"])) {
    return {
      id: id(),
      role: "ai",
      text: "Показываю пропущенные звонки прямо здесь, в чате.",
      createdAt: nowIso(),
      widget: "missed-calls-inline"
    };
  }


  if (asksTime || asksDate) {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const dateLabel = now.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long"
    });
    return {
      id: id(),
      role: "ai",
      text: asksTime && asksDate ? `Сейчас ${timeLabel}, ${dateLabel}.` : asksTime ? `Сейчас ${timeLabel}.` : `Сегодня ${dateLabel}.`,
      createdAt: nowIso()
    };
  }

  if (asksWeather) {
    return {
      id: id(),
      role: "ai",
      text:
        "В этой версии у меня нет прямого доступа к погодным сервисам в реальном времени. Могу подсказать, где посмотреть прогноз по Москве, или сразу помочь по задачам в кабинете (счета, звонки, обращения).",
      createdAt: nowIso(),
      suggested: ["Открыть Яндекс.Погоду", "Счета за март", "Пропущенные звонки"]
    };
  }

  if (asksRates) {
    return {
      id: id(),
      role: "ai",
      text:
        "Онлайн-курс валют я здесь не получаю в реальном времени. Если нужно, помогу с финансовыми данными внутри кабинета: счета, оплаты и отчёты.",
      createdAt: nowIso(),
      suggested: ["Счета за март", "Финансовый отчет", "Архив платежей"]
    };
  }

  if (asksNews) {
    return {
      id: id(),
      role: "ai",
      text:
        "Ленту новостей в реальном времени в этой демо-версии я не получаю. Зато могу сразу помочь с рабочими задачами в кабинете.",
      createdAt: nowIso(),
      suggested: ["Пропущенные звонки", "Обращения", "Мои счета"]
    };
  }

  if (asksCalculator) {
    const mathExpr = clean.match(/([0-9]+(?:[.,][0-9]+)?)\s*([+\-*/xх×])\s*([0-9]+(?:[.,][0-9]+)?)/);
    if (mathExpr) {
      const left = Number(mathExpr[1].replace(",", "."));
      const op = mathExpr[2];
      const right = Number(mathExpr[3].replace(",", "."));
      let result: number | null = null;
      if (op === "+" ) result = left + right;
      if (op === "-") result = left - right;
      if (op === "*" || op === "x" || op === "х" || op === "×") result = left * right;
      if (op === "/") result = right === 0 ? null : left / right;
      if (result !== null) {
        return {
          id: id(),
          role: "ai",
          text: `Результат: ${Number.isInteger(result) ? result : result.toLocaleString("ru-RU", { maximumFractionDigits: 6 })}.`,
          createdAt: nowIso()
        };
      }
    }
    return {
      id: id(),
      role: "ai",
      text:
        "Могу посчитать простой пример. Напишите в формате: `1250 + 340`, `18 * 7`, `144 / 12`.",
      createdAt: nowIso(),
      suggested: ["1250 + 340", "18 * 7", "144 / 12"]
    };
  }

  if (asksUnits) {
    const unitMatch = clean.match(
      /([0-9]+(?:[.,][0-9]+)?)\s*(км|м|см|мм|кг|г|мг|л|мл|час|часы|часа|мин|минута|минуты|сек|секунда|секунды)\s*(?:в|во)\s*(км|м|см|мм|кг|г|мг|л|мл|час|часы|часа|мин|минута|минуты|сек|секунда|секунды)/
    );
    if (unitMatch) {
      const value = Number(unitMatch[1].replace(",", "."));
      const fromRaw = unitMatch[2];
      const toRaw = unitMatch[3];
      const normalize = (u: string) => {
        if (u === "часы" || u === "часа") return "час";
        if (u === "минута" || u === "минуты") return "мин";
        if (u === "секунда" || u === "секунды") return "сек";
        return u;
      };
      const from = normalize(fromRaw);
      const to = normalize(toRaw);
      const factors: Record<string, number> = {
        км: 1000,
        м: 1,
        см: 0.01,
        мм: 0.001,
        кг: 1000,
        г: 1,
        мг: 0.001,
        л: 1000,
        мл: 1,
        час: 3600,
        мин: 60,
        сек: 1
      };
      const group = (u: string) => {
        if (["км", "м", "см", "мм"].includes(u)) return "length";
        if (["кг", "г", "мг"].includes(u)) return "mass";
        if (["л", "мл"].includes(u)) return "volume";
        if (["час", "мин", "сек"].includes(u)) return "time";
        return "other";
      };
      if (group(from) === group(to) && group(from) !== "other") {
        const result = (value * factors[from]) / factors[to];
        return {
          id: id(),
          role: "ai",
          text: `${value.toLocaleString("ru-RU")} ${fromRaw} = ${result.toLocaleString("ru-RU", {
            maximumFractionDigits: 6
          })} ${toRaw}.`,
          createdAt: nowIso()
        };
      }
    }
    return {
      id: id(),
      role: "ai",
      text:
        "Готов помочь с конвертацией. Введите запрос в формате: `15 км в м`, `2.5 кг в г`, `3 часа в минуты`.",
      createdAt: nowIso(),
      suggested: ["15 км в м", "2.5 кг в г", "3 часа в минуты"]
    };
  }

  if (asksReminder) {
    return {
      id: id(),
      role: "ai",
      text:
        "Напоминания в этой версии пока не ставятся автоматически. Могу сформулировать текст напоминания, чтобы вы сразу сохранили его в календарь.",
      createdAt: nowIso(),
      suggested: ["Напомни оплатить счет в 16:00", "Напомни перезвонить клиенту", "Сформулируй коротко"]
    };
  }

  if (hasGreeting) {
    return {
      id: id(),
      role: "ai",
      text: "И вам здравствуйте, желаю вам хорошего дня",
      createdAt: nowIso()
    };
  }

  if (p.includes("звонки за неделю")) {
    return {
      id: id(),
      role: "ai",
      text: "Сводка по звонкам за неделю — ниже. Могу детализировать пропущенные или сравнить с прошлой неделей.",
      createdAt: nowIso(),
      widget: "weekly-stats",
      suggested: ["Пропущенные звонки", "Статистика по времени суток"]
    };
  }

  if (asksInvoices && monthDetected === "март") {
    return {
      id: id(),
      role: "ai",
      text: "По счетам за март 2026: ниже список и суммы. Могу подготовить финансовый отчёт или выгрузку.",
      createdAt: nowIso(),
      widget: "invoices-march",
      suggested: ["Финансовый отчет", "Архив платежей"]
    };
  }

  if (asksInvoices && monthDetected && monthDetected !== "март") {
    return {
      id: id(),
      role: "ai",
      text: `Показываю счета за ${monthDetected} прямо в чате. Можно продолжить диалог без выхода из ассистента.`,
      createdAt: nowIso(),
      widget: "invoices-month",
      invoiceMonth: monthDetected,
      suggested: [`Счета за ${monthDetected}`, "Что просрочено?", "Покажи неоплаченные"]
    };
  }

  if (p.includes("мои счета") || p.includes("счета за")) {
    return {
      id: id(),
      role: "ai",
      text: "Показываю счета в чате. Можно сразу продолжить диалог — например, про оплату или сверку.",
      createdAt: nowIso(),
      widget: "invoices-march",
      suggested: ["Что просрочено?", "Как оплатить?", "Сверка по платежам"]
    };
  }

  const navIntent = getDemoNavigationIntent(prompt);
  if (navIntent) {
    return {
      id: id(),
      role: "ai",
      text: navIntent.ack,
      createdAt: nowIso(),
      navigateTo: navIntent.to
    };
  }

  if (p.includes("рассылк")) {
    return {
      id: id(),
      role: "ai",
      text:
        "Рекомендация: запустить рассылку по сегменту «оплата/баланс».\n\nПочему: по утру количество звонков -30% vs вчера, и растет риск по оплате.\n\nГотов(а) собрать текст и поставить на отправку.",
      createdAt: nowIso(),
      actions: [
        {
          type: "cta",
          title: "Запустить рассылку",
          subtitle: "Почему: звонки -30% (утро vs вчера)",
          ctaLabel: "Запустить",
          intent: "start-campaign"
        }
      ],
      suggested: ["Согласовать текст", "Покажи сегмент", "Отложить на 13:00"]
    };
  }

  if (p.includes("счет") || p.includes("счета") || p.includes("март")) {
    return {
      id: id(),
      role: "ai",
      text:
        "По счетам за март:\n\n- 2 счета в статусе «ожидает оплату»\n- 1 платеж отклонён (реквизиты)\n\nМогу: сформировать письмо клиенту, повторно отправить счет или подготовить акт сверки.",
      createdAt: nowIso(),
      suggested: ["Сформируй письмо", "Покажи детали", "Подготовь акт сверки"]
    };
  }

  if (p.includes("сводка")) {
    return {
      id: id(),
      role: "ai",
      text:
        "Сводка на сейчас:\n\n- Пропущенных: 15\n- Обработано: 3\n- Риск по оплате: 4 клиента\n\nХочешь, соберу отчет или покажу конкретные пропущенные звонки?",
      createdAt: nowIso(),
      suggested: ["Сформируй отчет", "Покажи пропущенные", "Сценарий перезвона"]
    };
  }

  const fallbacks: Pick<ChatMessage, "text" | "suggested">[] = [
    {
      text:
        "Понял запрос. Могу кратко сверить цифры по последним данным или собрать развёрнутую сводку — что удобнее сейчас?",
      suggested: ["Кратко по цифрам", "Развёрнуто", "Сравни с прошлой неделей"]
    },
    {
      text:
        "Ок, работаю с этим. Если нужно, подтяну счета, звонки или обращения в один ответ — с чего начнём?",
      suggested: ["Счета", "Звонки", "Обращения"]
    },
    {
      text:
        "Записал(а). Могу предложить следующий шаг: напоминание клиенту, черновик письма или отчёт для руководителя.",
      suggested: ["Напоминание", "Черновик письма", "Отчёт"]
    },
    {
      text:
        "Понял запрос. Могу ответить по задачам в кабинете: счета, звонки, обращения, рассылки и сводки. Что открыть в первую очередь?",
      suggested: ["Счета", "Звонки", "Обращения"]
    },
    {
      text:
        "Сейчас посмотрю контекст. Нужен ответ «в лоб» или с проверкой по договору и счетам?",
      suggested: ["В лоб", "С проверкой", "Только факты"]
    }
  ];
  const fb = fallbacks[hashPick(prompt, fallbacks.length)];
  return {
    id: id(),
    role: "ai",
    text: fb.text,
    createdAt: nowIso(),
    suggested: fb.suggested
  };
}

const pillBase =
  "inline-flex items-center gap-2 rounded-full bg-white px-[14px] py-[10px] text-[13px] font-medium text-[#3C4858] shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition hover:brightness-[1.02] active:scale-[0.99] dark:border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

function appendChatLog(userText: string, aiText: string, intent: ChatIntentId | "fallback" | "live") {
  if (typeof window === "undefined") return;
  const key = "b2b_chat_logs_v1";
  const current = JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{
    at: string;
    user: string;
    ai: string;
    intent: string;
  }>;
  current.push({ at: new Date().toISOString(), user: userText, ai: aiText, intent });
  window.localStorage.setItem(key, JSON.stringify(current.slice(-300)));
}

function exportChatLogsToFile() {
  if (typeof window === "undefined") return false;
  const key = "b2b_chat_logs_v1";
  const raw = window.localStorage.getItem(key);
  if (!raw) return false;
  const blob = new Blob([raw], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chat-logs-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

function buildDataContextSummary(invoices: InvoiceItem[]) {
  const perMonth = ["январь", "февраль", "март", "апрель"]
    .map((m) => {
      const monthInvoices = invoices.filter((inv) => inv.periodLabel.includes(m));
      const sum = monthInvoices.reduce((s, inv) => s + inv.amountRub, 0);
      const unpaid = monthInvoices.filter((inv) => inv.status === "pay").length;
      return `${m}: счетов ${monthInvoices.length}, сумма ${sum.toLocaleString("ru-RU")} ₽, неоплаченных ${unpaid}`;
    })
    .join("; ");
  const missed = standaloneCalls.filter((c) => c.missed).length;
  return `Счета по месяцам: ${perMonth}. Звонки: всего ${standaloneCalls.length}, пропущенных ${missed}.`;
}

export function AiAssistantScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = React.useState<ChatMessage[]>(defaultChat);
  const [input, setInput] = React.useState("");
  const [openHistory, setOpenHistory] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [chipTags, setChipTags] = React.useState<string[]>(() => [...recentQueryChips]);
  const [showMissedCard, setShowMissedCard] = React.useState(true);
  const [showWeeklyCard, setShowWeeklyCard] = React.useState(true);
  const [heroCard, setHeroCard] = React.useState(0);
  const [weeklySpeaking, setWeeklySpeaking] = React.useState(false);
  const heroSwipeStartX = React.useRef<number | null>(null);
  const heroWheelLastAt = React.useRef(0);
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);
  const handledQueryRef = React.useRef<string>("");
  const runtimeInvoices = useRuntimeInvoices();
  const unpaidInvoicesCount = runtimeInvoices.filter((inv) => inv.status === "pay").length;
  const liveApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const liveModel = process.env.NEXT_PUBLIC_OPENROUTER_MODEL;
  const isLiveEnabled = Boolean(liveApiKey);

  React.useEffect(() => {
    setShowMissedCard(!isMissedCallsSeen());
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  React.useEffect(() => {
    const scrollToEnd = (behavior: ScrollBehavior) => {
      chatEndRef.current?.scrollIntoView({ behavior, block: "end" });
    };
    scrollToEnd("auto");
    const t = window.setTimeout(() => scrollToEnd("smooth"), 180);
    return () => window.clearTimeout(t);
  }, [messages]);

  React.useEffect(() => {
    if (searchParams.get("reset") !== "1") return;
    setMessages(defaultChat);
    setInput("");
    setOpenHistory(false);
    setToast(null);
    setChipTags([...recentQueryChips]);
    router.replace("/assistant/");
  }, [router, searchParams]);

  React.useEffect(() => {
    const q = searchParams.get("q");
    if (!q || handledQueryRef.current === q) return;
    handledQueryRef.current = q;
    setInput(q);
    window.setTimeout(() => send(q), 60);
    router.replace("/assistant/");
  }, [router, searchParams]);

  const send = (text?: string) => {
    const v = (text ?? input).trim();
    if (!v) return;
    if (containsProfanity(v)) {
      const moderationReply: ChatMessage = {
        id: id(),
        role: "ai",
        text: "Вижу нецензурную лексику. Давайте продолжим по-деловому: счета, звонки, обращения или аналитика.",
        createdAt: nowIso(),
        suggested: ["Счета", "Звонки", "Обращения"]
      };
      setMessages((m) => [...m, { id: id(), role: "user", text: v, createdAt: nowIso() }, moderationReply]);
      appendChatLog(v, moderationReply.text, "profanity");
      setInput("");
      return;
    }
    if (/экспорт.*(лог|журнал)|скач.*(лог|журнал)/i.test(v)) {
      const ok = exportChatLogsToFile();
      setToast(ok ? "Журнал чата выгружен в JSON." : "Журнал пуст: пока нет сохраненных диалогов.");
      return;
    }

    const userMsg: ChatMessage = { id: id(), role: "user", text: v, createdAt: nowIso() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    window.setTimeout(async () => {
      const fallback = mockAiResponse(v, runtimeInvoices);
      let resolved: ChatMessage = fallback;
      const intentDetected = detectIntent(v);
      let intentUsed: ChatIntentId | "fallback" | "live" = intentDetected ?? "fallback";

      try {
        if (isLiveEnabled && liveApiKey) {
          const controller = new AbortController();
          const timeout = window.setTimeout(() => controller.abort(), 2500);
          try {
            const history: LiveAiMessage[] = [...messages, userMsg]
              .slice(-6)
              .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));
            const liveText = await getLiveAiText({
              prompt: v,
              history,
              apiKey: liveApiKey,
              model: liveModel,
              contextSummary: buildDataContextSummary(runtimeInvoices),
              signal: controller.signal
            });
            if (liveText) {
              resolved = {
                id: id(),
                role: "ai",
                text: liveText,
                createdAt: nowIso()
              };
              intentUsed = "live";
            }
          } finally {
            window.clearTimeout(timeout);
          }
        }
      } catch {
        resolved = fallback;
      }

      setMessages((m) => [...m, resolved]);
      appendChatLog(v, resolved.text, intentUsed);
      if (resolved.navigateTo) {
        window.setTimeout(() => router.push(resolved.navigateTo!), 320);
      }
    }, 350);
  };

  const hasChat = messages.length > 0;
  const onHeroPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    heroSwipeStartX.current = e.clientX;
  };
  const onHeroPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = heroSwipeStartX.current;
    heroSwipeStartX.current = null;
    if (start === null) return;
    const delta = e.clientX - start;
    if (Math.abs(delta) < 40) return;
    if (delta < 0 && showWeeklyCard) setHeroCard(1);
    if (delta > 0 && showMissedCard) setHeroCard(0);
  };
  const onHeroWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - heroWheelLastAt.current < 220) return;
    const horizontal = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(horizontal) < 28) return;
    heroWheelLastAt.current = now;
    if (horizontal > 0 && showWeeklyCard) setHeroCard(1);
    if (horizontal < 0 && showMissedCard) setHeroCard(0);
  };

  return (
    <div className="space-y-5 pb-[140px]">
      {!hasChat ? (
        <>
          <div
            className="-mx-1 cursor-grab px-1 active:cursor-grabbing"
            onPointerDown={onHeroPointerDown}
            onPointerUp={onHeroPointerUp}
            onPointerCancel={() => {
              heroSwipeStartX.current = null;
            }}
            onWheel={onHeroWheel}
            style={{ touchAction: "pan-y" }}
          >
            {heroCard === 0 && showMissedCard ? (
              <MissedCallSummaryCard
                onDismiss={() => {
                  setHeroCard(showWeeklyCard ? 1 : 0);
                }}
              />
            ) : null}
            {(heroCard === 1 || !showMissedCard) && showWeeklyCard ? (
              <Card className="border-[#E8EAED] dark:border-slate-700">
                <CardContent className="space-y-3 pb-4 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        Еженедельный отчет
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        126 звонков, 6 пропущенных, средняя длительность 2:40. Есть 4 клиента в риске по оплате.
                      </p>
                    </div>
                    <button type="button" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setShowWeeklyCard(false)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECEAFD]"
                      onClick={() => {
                        if (
                          typeof window === "undefined" ||
                          !("speechSynthesis" in window) ||
                          !("SpeechSynthesisUtterance" in window)
                        ) {
                          return;
                        }
                        if (weeklySpeaking) {
                          window.speechSynthesis.cancel();
                          setWeeklySpeaking(false);
                          return;
                        }
                        const u = new SpeechSynthesisUtterance(
                          "Еженедельный отчет: 126 звонков, 6 пропущенных, средняя длительность две минуты сорок секунд. Есть 4 клиента в риске по оплате."
                        );
                        u.lang = "ru-RU";
                        u.onend = () => setWeeklySpeaking(false);
                        u.onerror = () => setWeeklySpeaking(false);
                        setWeeklySpeaking(true);
                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(u);
                      }}
                    >
                      {weeklySpeaking ? <Pause className="h-4 w-4 text-[#4B5563]" /> : <Play className="h-4 w-4 text-[#4B5563]" />}
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-accent-dark underline dark:text-accent-yellow"
                      onClick={() => {
                        setInput("звонки за неделю");
                        window.setTimeout(() => send("звонки за неделю"), 60);
                      }}
                    >
                      Открыть в чате
                    </button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
            {showMissedCard && showWeeklyCard ? (
              <div className="mt-2 flex justify-center gap-1.5">
                <button type="button" className={cn("h-1.5 w-5 rounded-full", heroCard === 0 ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-300 dark:bg-slate-600")} onClick={() => setHeroCard(0)} />
                <button type="button" className={cn("h-1.5 w-5 rounded-full", heroCard === 1 ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-300 dark:bg-slate-600")} onClick={() => setHeroCard(1)} />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-center px-1 pt-1 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[22px] font-semibold tracking-tight text-[#212529] dark:text-slate-100">
                Билайн
              </span>
              <Image
                src={sphereSrc}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover shadow-sm ring-1 ring-black/5"
              />
              <span className="text-[22px] font-semibold tracking-tight text-accent-yellow">One</span>
            </div>
            <h1 className="mt-3 max-w-[18rem] text-[26px] font-semibold leading-[1.15] tracking-tight text-[#212529] dark:text-slate-100">
              Ваш бизнес ассистент
            </h1>
            <p className="mt-2 text-[13px] text-[#8E8E93] dark:text-slate-400">{userProfile.legalName}</p>
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <div className="flex w-full max-w-[360px] justify-center gap-2.5">
              <button
                type="button"
                className={pillBase}
                onClick={() => {
                  markMissedCallsSeen();
                  setShowMissedCard(false);
                  router.push("/missed-calls/");
                }}
              >
                <span>Пропущенные звонки</span>
                {!isMissedCallsSeen() ? (
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#FF3B4E] px-1.5 text-[11px] font-bold text-white">
                    6
                  </span>
                ) : null}
              </button>
              <Link href="/appeals/" className={pillBase}>
                <span>Обращения</span>
              </Link>
            </div>
            <div className="flex w-full max-w-[360px] flex-wrap justify-center gap-2.5">
              <button
                type="button"
                className={pillBase}
                onClick={() => {
                  router.push("/invoices/");
                }}
              >
                <span>Мои счета</span>
              </button>
              <button type="button" className={pillBase} onClick={() => router.push("/invoices/")}>
                <span>Счета на оплату</span>
                {unpaidInvoicesCount > 0 ? (
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#2D2D2D] px-1.5 text-[11px] font-bold text-white dark:bg-slate-200 dark:text-slate-900">
                    {unpaidInvoicesCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

        </>
      ) : null}

      <div className="space-y-3">
        {hasChat ? (
          <button
            type="button"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-softSm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            onClick={() => {
              setMessages(defaultChat);
              setInput("");
              setToast(null);
              setChipTags([...recentQueryChips]);
            }}
          >
            Назад
          </button>
        ) : null}
        <AnimatePresence initial={false}>
          {hasChat ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-3"
            >
              {messages.map((m) => (
                <div key={m.id} className="space-y-2">
                  <ChatBubble
                    message={m}
                    onSuggestedClick={(s) => {
                      setInput(s);
                      window.setTimeout(() => send(s), 100);
                    }}
                  />

                  {m.role === "ai" && m.widget === "weekly-stats" ? (
                    <WeeklyStatsWidget
                      variant="weekly-stats"
                      onAskInChat={(question) => {
                        setInput(question);
                        window.setTimeout(() => send(question), 80);
                      }}
                    />
                  ) : null}
                  {m.role === "ai" && m.widget === "weekly-stats-expanded" ? (
                    <WeeklyStatsWidget
                      variant="weekly-stats-expanded"
                      onAskInChat={(question) => {
                        setInput(question);
                        window.setTimeout(() => send(question), 80);
                      }}
                    />
                  ) : null}
                  {m.role === "ai" && m.widget === "invoices-march" ? <InvoicesMarchWidget /> : null}
                  {m.role === "ai" && m.widget === "invoices-month" ? (
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardContent className="space-y-2 pb-3 pt-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Счета за {m.invoiceMonth}
                        </div>
                        {runtimeInvoices
                          .filter((inv) => inv.periodLabel.includes(m.invoiceMonth ?? ""))
                          .map((inv) => (
                            <div
                              key={inv.id}
                              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-left dark:border-slate-600 dark:bg-slate-800"
                            >
                              <span className="text-sm text-slate-800 dark:text-slate-200">
                                {inv.amountRub.toLocaleString("ru-RU")} ₽
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {inv.status === "paid" ? "Оплачен" : inv.status === "pay" ? "Не оплачен" : "В оплате"}
                              </span>
                            </div>
                          ))}
                        {(m.invoiceMonth === "февраль" || m.invoiceMonth === "март") ? (
                          <p className="pt-1 text-xs text-slate-600 dark:text-slate-300">
                            Разница (февраль vs март):{" "}
                            {(
                              runtimeInvoices
                                .filter((inv) => inv.periodLabel.includes("март"))
                                .reduce((sum, inv) => sum + inv.amountRub, 0) -
                              runtimeInvoices
                                .filter((inv) => inv.periodLabel.includes("февраль"))
                                .reduce((sum, inv) => sum + inv.amountRub, 0)
                            ).toLocaleString("ru-RU")}{" "}
                            ₽
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  ) : null}
                  {m.role === "ai" && m.widget === "missed-calls-inline" ? (
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardContent className="space-y-2 pb-3 pt-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Пропущенные в чате
                        </div>
                        {standaloneCalls
                          .filter((c) => c.missed)
                          .map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-left dark:border-slate-600 dark:bg-slate-800"
                              onClick={() => router.push(`/call/${c.id}/`)}
                            >
                              <span className="text-sm text-slate-800 dark:text-slate-200">{c.title ?? c.phone}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{c.time}</span>
                            </button>
                          ))}
                      </CardContent>
                    </Card>
                  ) : null}

                  {m.role === "ai" && m.actions?.length
                    ? m.actions.map((a, idx) => (
                        <ActionCard
                          key={`${m.id}-${idx}`}
                          title={a.title}
                          subtitle={a.subtitle}
                          ctaLabel={a.ctaLabel}
                          onCta={() => {
                            if (a.intent === "start-campaign")
                              setToast("Рассылка: черновик создан, отправка поставлена в очередь.");
                            else if (a.intent === "pay-balance") setToast("Платеж: черновик пополнения подготовлен.");
                            else if (a.intent === "generate-report") setToast("Отчет: черновик сформирован.");
                            else setToast("Действие выполнено (демо).");
                          }}
                        />
                      ))
                    : null}
                </div>
              ))}
              <div ref={chatEndRef} className="h-[112px]" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {!hasChat && chipTags.length > 0 ? (
        <div className="fixed bottom-[104px] left-0 right-0 z-30 mx-auto w-full max-w-[430px]">
          <div className="safe-px">
            <div className="flex flex-wrap gap-2">
              {chipTags.map((label) => (
                <div
                  key={label}
                  className="inline-flex items-center overflow-hidden rounded-full border border-[#E8EAED] bg-white text-[12px] font-medium text-[#3C4858] shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  <button
                    type="button"
                    className="px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700"
                    onClick={() => {
                      setInput(label);
                      window.setTimeout(() => send(label), 50);
                    }}
                  >
                    {label}
                  </button>
                  <button
                    type="button"
                    className="border-l border-[#E8EAED] px-2 py-1.5 text-[#C7C7CC] hover:bg-slate-100 hover:text-slate-600 dark:border-slate-600 dark:hover:bg-slate-700"
                    aria-label="Убрать"
                    onClick={() => setChipTags((t) => t.filter((x) => x !== label))}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <BottomInputBar
        placement="fixedBottom"
        variant="assistant"
        value={input}
        onChange={setInput}
        onSend={(t) => send(t)}
        onOpenHistory={() => setOpenHistory(true)}
      />

      {toast ? (
        <div className="fixed bottom-[120px] left-0 right-0 z-40 mx-auto w-full max-w-[430px]">
          <div className="safe-px">
            <Card className="border-[#E8EAED] dark:border-slate-600">
              <CardContent className="pb-3 pt-3">
                <div className="text-sm text-[#212529] dark:text-slate-100">{toast}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      <Modal open={openHistory} onClose={() => setOpenHistory(false)} title="История запросов">
        <div className="space-y-2">
          {chatHistoryPresets.map((h) => (
            <button
              key={h.id}
              type="button"
              className="w-full rounded-[18px] border border-[#E8EAED] bg-white p-3 text-left shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              onClick={() => {
                setMessages(h.messages);
                setOpenHistory(false);
                setToast(`Загружено: «${h.title}».`);
              }}
            >
              <div className="text-sm font-semibold text-[#212529] dark:text-slate-100">{h.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-[#8E8E93]">{h.preview}</div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
