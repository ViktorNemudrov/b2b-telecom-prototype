"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Sparkles, X } from "lucide-react";
import { InvoicesMarchWidget } from "@shared/components/ai/InvoicesMarchWidget";
import { WeeklyStatsWidget } from "@shared/components/ai/WeeklyStatsWidget";
import { ActionCard } from "@shared/components/ActionCard";
import { BottomInputBar } from "@shared/components/BottomInputBar";
import { ChatBubble } from "@shared/components/ChatBubble";
import { Card, CardContent } from "@shared/components/ui/card";
import { Modal } from "@shared/components/ui/modal";
import { cn } from "@shared/components/ui/cn";
import {
  chatHistoryPresets,
  defaultChat,
  recentQueryChips,
  userProfile,
  standaloneCalls,
  type ChatMessage,
  type InvoiceItem
} from "@shared/lib/mockData";
import { getLiveAiText, type LiveAiMessage } from "@shared/lib/liveAi";
import {
  buildSafeLiveFallbackResponse,
  isLiveResponseReliable,
  resolveDeterministicResponse,
  resolveSpecialMockResponse
} from "@shared/lib/assistantResponse";
import { useRuntimeInvoices } from "@shared/lib/runtimeInvoices";
import { isMissedCallsSeen, markMissedCallsSeen } from "@shared/lib/runtimeFlags";

const sphereSrc = "/mockups/%D0%A8%D0%B0%D1%80.png";

function id() {
  return Math.random().toString(16).slice(2);
}

function nowIso() {
  return new Date().toISOString();
}

function toAiMessage(payload: Pick<ChatMessage, "text" | "widget" | "invoiceMonth" | "suggested" | "navigateTo" | "actions">): ChatMessage {
  return {
    id: id(),
    role: "ai",
    createdAt: nowIso(),
    ...payload
  };
}

const pillBase =
  "inline-flex items-center gap-2 rounded-full bg-white px-[14px] py-[10px] text-[13px] font-medium text-[#3C4858] shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition hover:brightness-[1.02] active:scale-[0.99] dark:border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

function appendChatLog(userText: string, aiText: string, intent: string) {
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
    if (/экспорт.*(лог|журнал)|скач.*(лог|журнал)/i.test(v)) {
      const ok = exportChatLogsToFile();
      setToast(ok ? "Журнал чата выгружен в JSON." : "Журнал пуст: пока нет сохраненных диалогов.");
      return;
    }

    const userMsg: ChatMessage = { id: id(), role: "user", text: v, createdAt: nowIso() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    window.setTimeout(async () => {
      const specialMock = resolveSpecialMockResponse(v);
      if (specialMock) {
        const resolved = toAiMessage(specialMock);
        setMessages((m) => [...m, resolved]);
        appendChatLog(v, resolved.text, "special-mock");
        return;
      }

      const deterministic = resolveDeterministicResponse(v, runtimeInvoices);
      if (deterministic) {
        const resolved = toAiMessage(deterministic);
        setMessages((m) => [...m, resolved]);
        appendChatLog(v, resolved.text, "deterministic");
        if (resolved.navigateTo) {
          window.setTimeout(() => router.push(resolved.navigateTo!), 320);
        }
        return;
      }

      let resolved: ChatMessage = toAiMessage({
        text:
          "Для этого запроса нужен live AI-ответ. Подключите `NEXT_PUBLIC_OPENROUTER_API_KEY`, и я передам вопрос в модель.",
        suggested: ["Счета за март", "Звонки за неделю", "Активные обращения"]
      });
      let intentUsed = "fallback-no-live";

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
            if (liveText && isLiveResponseReliable(v, liveText)) {
              resolved = {
                id: id(),
                role: "ai",
                text: liveText,
                createdAt: nowIso()
              };
              intentUsed = "live";
            } else if (liveText) {
              resolved = toAiMessage(buildSafeLiveFallbackResponse());
              intentUsed = "live-rejected";
            }
          } finally {
            window.clearTimeout(timeout);
          }
        }
      } catch {}

      if (resolved.text.includes("нужен live AI-ответ")) {
        intentUsed = "fallback-no-live";
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
              <Card className="min-h-[170px] rounded-[20px] border-[#E5E7EE] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
                <CardContent className="space-y-3 pb-4 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Пропущенные звонки</div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        За неделю пропущено 6 звонков. Рекомендуем обработать их в первую очередь.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setHeroCard(showWeeklyCard ? 1 : 0)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-accent-dark underline dark:text-accent-yellow"
                    onClick={() => {
                      markMissedCallsSeen();
                      setShowMissedCard(false);
                      router.push("/missed-calls/");
                    }}
                  >
                    Открыть пропущенные
                  </button>
                </CardContent>
              </Card>
            ) : null}
            {(heroCard === 1 || !showMissedCard) && showWeeklyCard ? (
              <Card className="min-h-[170px] rounded-[20px] border-[#E5E7EE] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
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
                  {m.role === "ai" && m.widget === "invoices-unpaid-inline" ? (
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardContent className="space-y-2 pb-3 pt-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Неоплаченные счета
                        </div>
                        {runtimeInvoices
                          .filter((inv) => inv.status === "pay")
                          .map((inv) => (
                            <button
                              key={inv.id}
                              type="button"
                              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-left dark:border-slate-600 dark:bg-slate-800"
                              onClick={() => router.push(`/invoices/${inv.id}/`)}
                            >
                              <span className="text-sm text-slate-800 dark:text-slate-200">
                                {inv.amountRub.toLocaleString("ru-RU")} ₽
                              </span>
                              <span className="text-xs text-rose-700 dark:text-rose-300">Не оплачен</span>
                            </button>
                          ))}
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
