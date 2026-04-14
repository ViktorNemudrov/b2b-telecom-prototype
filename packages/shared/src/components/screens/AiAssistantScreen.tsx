"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
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
  type ChatMessage
} from "@shared/lib/mockData";

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

function mockAiResponse(prompt: string): ChatMessage {
  const p = prompt.toLowerCase();

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

  if ((p.includes("счет") || p.includes("счета")) && (p.includes("март") || p.includes("2026"))) {
    return {
      id: id(),
      role: "ai",
      text: "По счетам за март 2026: ниже список и суммы. Могу подготовить финансовый отчёт или выгрузку.",
      createdAt: nowIso(),
      widget: "invoices-march",
      suggested: ["Финансовый отчет", "Архив платежей"]
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
        "Есть. Уточни, пожалуйста: это про оплату, про связь с клиентом или про внутреннюю аналитику?",
      suggested: ["Оплата", "Клиенты", "Аналитика"]
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

export function AiAssistantScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = React.useState<ChatMessage[]>(defaultChat);
  const [input, setInput] = React.useState("");
  const [openHistory, setOpenHistory] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [chipTags, setChipTags] = React.useState<string[]>(() => [...recentQueryChips]);
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);

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
    if (!q) return;
    setInput(q);
    window.setTimeout(() => send(q), 60);
    router.replace("/assistant/");
  }, [router, searchParams]);

  const send = (text?: string) => {
    const v = (text ?? input).trim();
    if (!v) return;

    const userMsg: ChatMessage = { id: id(), role: "user", text: v, createdAt: nowIso() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    window.setTimeout(() => {
      const ai = mockAiResponse(v);
      setMessages((m) => [...m, ai]);
      if (ai.navigateTo) {
        window.setTimeout(() => router.push(ai.navigateTo!), 320);
      }
    }, 350);
  };

  const hasChat = messages.length > 0;

  return (
    <div className="space-y-5 pb-[140px]">
      {!hasChat ? (
        <>
          <MissedCallSummaryCard />

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
              <Link href="/missed-calls/" className={pillBase}>
                <span>Пропущенные звонки</span>
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#FF3B4E] px-1.5 text-[11px] font-bold text-white">
                  6
                </span>
              </Link>
              <Link href="/appeals/" className={pillBase}>
                <span>Обращения</span>
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#2D2D2D] px-1.5 text-[11px] font-bold text-white dark:bg-slate-200 dark:text-slate-900">
                  3
                </span>
              </Link>
            </div>
            <div className="flex w-full max-w-[360px] flex-wrap justify-center gap-2.5">
              <button
                type="button"
                className={pillBase}
                onClick={() => {
                  setInput("мои счета");
                  window.setTimeout(() => send("мои счета"), 50);
                }}
              >
                <span>Мои счета</span>
              </button>
              <Link href="/invoices/" className={pillBase}>
                <span>Счета на оплату</span>
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#2D2D2D] px-1.5 text-[11px] font-bold text-white dark:bg-slate-200 dark:text-slate-900">
                  3
                </span>
              </Link>
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
                    <WeeklyStatsWidget variant="weekly-stats" />
                  ) : null}
                  {m.role === "ai" && m.widget === "weekly-stats-expanded" ? (
                    <WeeklyStatsWidget variant="weekly-stats-expanded" />
                  ) : null}
                  {m.role === "ai" && m.widget === "invoices-march" ? <InvoicesMarchWidget /> : null}

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
