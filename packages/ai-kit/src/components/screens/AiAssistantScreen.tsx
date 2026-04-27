"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronLeft, ChevronRight, Loader2, Pause, PhoneOff, Play, Sparkles, X } from "lucide-react";
import { InvoicesMarchWidget } from "@shared/components/ai/InvoicesMarchWidget";
import { MyNumbersInlineWidget } from "@shared/components/ai/MyNumbersInlineWidget";
import { SubscriptionBalanceInlineWidget } from "@shared/components/ai/SubscriptionBalanceInlineWidget";
import { WeeklyStatsWidget } from "@shared/components/ai/WeeklyStatsWidget";
import { ActionCard } from "@shared/components/ActionCard";
import { BottomInputBar } from "@shared/components/BottomInputBar";
import { ChatBubble } from "@shared/components/ChatBubble";
import { Card, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Modal } from "@shared/components/ui/modal";
import { cn } from "@shared/components/ui/cn";
import {
  getAppealsFiltered,
  chatHistoryPresets,
  defaultChat,
  recentHistoryQuickPrompts,
  recentQueryChips,
  userProfile,
  standaloneCalls,
  type ChatMessage,
  type InvoiceItem
} from "@shared/lib/mockData";
import {
  DEFAULT_GROQ_FALLBACK_MODELS,
  LIVE_FETCH_TIMEOUT_MS,
  parseOpenRouterModelChain
} from "@shared/lib/aiLiveConfig";
import { emitAiMetric } from "@shared/lib/aiClientMetrics";
import { getLiveAiText, type LiveAiMessage } from "@shared/lib/liveAi";
import {
  benchmarkAndOrderLiveProviders,
  fingerprintLiveProviders,
  LIVE_PROVIDER_RANK_TTL_MS,
  orderCandidatesFromStored,
  readStoredRank,
  shouldSkipLiveProviderBenchmark,
  writeStoredRank
} from "@shared/lib/liveAiProviderRank";
import { appealsListHref } from "@shared/lib/appealsBackFallback";
import { safeParseLiveUserPrompt } from "@shared/lib/liveUserPromptSchema";
import { shouldDelegateBackToHistory } from "@shared/lib/smartBack";
import {
  buildNoLiveKeysFallbackResponse,
  buildSafeLiveFallbackResponse,
  isLiveResponseReliable,
  resolveDeterministicResponse,
  resolveSessionMemoryResponse,
  resolveSpecialMockResponse
} from "@shared/lib/assistantResponse";
import { useRuntimeInvoices } from "@shared/lib/runtimeInvoices";
import { isMissedCallsSeen, markMissedCallsSeen } from "@shared/lib/runtimeFlags";
import {
  clearAssistantChatSession,
  hydrateThreadIfEmptyInUi,
  loadAssistantChatSession,
  persistAssistantChatSession
} from "@shared/lib/assistantChatSession";
import { useDemoSession } from "@shared/components/DemoSessionProvider";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";

const sphereSrc = "/mockups/%D0%A8%D0%B0%D1%80.png";
type LiveProvider = "gemini" | "together" | "openrouter" | "groq" | "grok";
type LiveCandidate = { provider: LiveProvider; apiKey: string; model: string };

function id() {
  return Math.random().toString(16).slice(2);
}

function nowIso() {
  return new Date().toISOString();
}

function toAiMessage(payload: Pick<ChatMessage, "text" | "widget" | "invoiceMonth" | "suggested" | "navigateTo" | "actions" | "sourceLabel">): ChatMessage {
  return {
    id: id(),
    role: "ai",
    createdAt: nowIso(),
    ...payload
  };
}

const pillBase =
  "inline-flex items-center gap-2 rounded-full bg-white px-[13px] py-[8px] text-[13px] font-medium text-[#3C4858] shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition hover:brightness-[1.02] active:scale-[0.99] dark:border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

function appendChatLog(userText: string, aiText: string, intent: string) {
  if (typeof window === "undefined") return;
  const key = "b2b_chat_logs_v1";
  let current: Array<{ at: string; user: string; ai: string; intent: string }>;
  try {
    current = JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{
      at: string;
      user: string;
      ai: string;
      intent: string;
    }>;
    if (!Array.isArray(current)) current = [];
  } catch {
    current = [];
  }
  current.push({ at: new Date().toISOString(), user: userText, ai: aiText, intent });
  try {
    window.localStorage.setItem(key, JSON.stringify(current.slice(-300)));
  } catch {
    // private mode / quota
  }
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

function traceAiSource(sourceLabel: string, prompt: string): void {
  const isDev = typeof process !== "undefined" && process.env?.NODE_ENV === "development";
  if (!isDev) return;
  if (typeof window === "undefined") return;
  try {
    const key = "b2b_ai_self_check_trace_v1";
    const cur = JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{
      at: string;
      source: string;
      prompt: string;
    }>;
    const next = Array.isArray(cur) ? cur : [];
    next.push({ at: new Date().toISOString(), source: sourceLabel, prompt });
    window.localStorage.setItem(key, JSON.stringify(next.slice(-50)));
  } catch {
    // ignore storage issues (private mode/limits)
  }
}

function getLiveProviderLabel(provider: LiveProvider) {
  if (provider === "gemini") return "ответ от Google Gemini";
  if (provider === "together") return "ответ от Together AI";
  if (provider === "openrouter") return "ответ от OpenRouter";
  if (provider === "grok") return "ответ от Grok/xAI";
  return "ответ от Groq";
}

function getAiSourceLabel(intentUsed: string, liveProvider: LiveProvider) {
  switch (intentUsed) {
    case "special-mock":
      return "замоканный ответ";
    case "deterministic":
      return "детерминированный сценарий";
    case "session-memory":
      return "память в рамках диалога";
    case "live":
      return getLiveProviderLabel(liveProvider);
    case "live-rejected":
      return "live ответ отклонен (ненадежный)";
    case "live-unavailable":
    case "live-error":
    case "fallback-no-live":
    case "no-live-keys":
      return "";
    default:
      return intentUsed;
  }
}

function formatLiveErrorLabel(err: unknown, liveProvider: LiveProvider) {
  const base = `${getLiveProviderLabel(liveProvider)} (ошибка)`;
  const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const trimmed = msg.trim();
  if (trimmed.toLowerCase().includes("failed to fetch")) {
    return `${base}: сеть или CORS (браузер часто блокирует прямой вызов API; см. NEXT_PUBLIC_LLM_PROXY_URL)`;
  }
  if (!trimmed) return base;
  return `${base}: ${trimmed.slice(0, 90)}`;
}

function liveProviderShort(p: LiveProvider): string {
  switch (p) {
    case "gemini":
      return "Gemini";
    case "together":
      return "Together";
    case "openrouter":
      return "OpenRouter";
    case "grok":
      return "Grok";
    default:
      return "Groq";
  }
}

function parseModelList(primary: string | undefined, fallbacks: string[]): string[] {
  const raw = (primary ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return Array.from(new Set([...raw, ...fallbacks]));
}

function buildLiveCandidates(args: {
  geminiApiKey?: string;
  geminiModel: string;
  togetherApiKey?: string;
  togetherModel: string;
  openRouterApiKey?: string;
  openRouterModel?: string;
  grokApiKey?: string;
  grokModel: string;
  groqApiKey?: string;
  groqModel: string;
}): LiveCandidate[] {
  const candidates: LiveCandidate[] = [];
  if (args.geminiApiKey) {
    for (const model of parseModelList(args.geminiModel, ["gemini-2.0-flash", "gemini-2.0-flash-lite"])) {
      candidates.push({ provider: "gemini", apiKey: args.geminiApiKey, model });
    }
  }
  if (args.togetherApiKey) {
    for (const model of parseModelList(args.togetherModel, ["meta-llama/Llama-3.3-70B-Instruct-Turbo"])) {
      candidates.push({ provider: "together", apiKey: args.togetherApiKey, model });
    }
  }
  if (args.openRouterApiKey) {
    for (const model of parseOpenRouterModelChain(args.openRouterModel)) {
      candidates.push({
        provider: "openrouter",
        apiKey: args.openRouterApiKey,
        model
      });
    }
  }
  if (args.grokApiKey) {
    for (const model of parseModelList(args.grokModel, ["grok-3-mini"])) {
      candidates.push({ provider: "grok", apiKey: args.grokApiKey, model });
    }
  }
  if (args.groqApiKey) {
    for (const model of parseModelList(args.groqModel, [...DEFAULT_GROQ_FALLBACK_MODELS])) {
      candidates.push({ provider: "groq", apiKey: args.groqApiKey, model });
    }
  }
  return candidates;
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
  const { authenticated } = useDemoSession();
  const [messages, setMessages] = React.useState<ChatMessage[]>(defaultChat);
  const skipPersistAfterRestore = React.useRef(0);
  const skipPersistAfterEmptyDismiss = React.useRef(0);
  const [input, setInput] = React.useState("");
  const [openHistory, setOpenHistory] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [chipTags, setChipTags] = React.useState<string[]>(() => [...recentQueryChips]);
  const [showMissedCard, setShowMissedCard] = React.useState(true);
  const [showWeeklyCard, setShowWeeklyCard] = React.useState(true);
  const [showAiAssistCard] = React.useState(true);
  const [heroCard, setHeroCard] = React.useState(0);
  const [heroTransitionDirection, setHeroTransitionDirection] = React.useState(0);
  const [weeklySpeaking, setWeeklySpeaking] = React.useState(false);
  const heroSwipeStartX = React.useRef<number | null>(null);
  const heroWheelLastAt = React.useRef(0);
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledOnRestoreRef = React.useRef(false);
  const prevMessagesLengthRef = React.useRef(0);
  const handledQueryRef = React.useRef<string>("");
  const sendSeqRef = React.useRef(0);
  const liveAbortRef = React.useRef<AbortController | null>(null);
  // Keep browser timer id type to avoid Node.js Timeout mismatch in CI.
  const replyTimeoutRef = React.useRef<number | null>(null);
  const aiReplyPendingRef = React.useRef(false);
  const [aiReplyPending, setAiReplyPending] = React.useState(false);
  const runtimeInvoices = useRuntimeInvoices();
  const chatAppeals = React.useMemo(() => getAppealsFiltered("all").filter((a) => a.status === "active").slice(0, 3), []);
  const inWorkAppealsCount = React.useMemo(() => chatAppeals.filter((a) => a.badgeLabel.includes("работе")).length, [chatAppeals]);
  const signPendingAppealsCount = React.useMemo(() => chatAppeals.filter((a) => a.badgeLabel.includes("подпис")).length, [chatAppeals]);
  const missedChipCustom = useUiCustomization("assistant.home.missed");
  const appealsChipCustom = useUiCustomization("assistant.home.appeals");
  const invoicesChipCustom = useUiCustomization("assistant.home.invoices");
  const unpaidChipCustom = useUiCustomization("assistant.home.unpaid");
  const unpaidInvoicesCount = runtimeInvoices.filter((inv) => inv.status === "pay").length;
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
  const togetherApiKey = process.env.NEXT_PUBLIC_TOGETHER_API_KEY?.trim();
  const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.trim();
  const grokApiKey = process.env.NEXT_PUBLIC_GROK_API_KEY?.trim();
  const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim();
  const liveProxyUrl = process.env.NEXT_PUBLIC_LLM_PROXY_URL?.trim() || "/api/llm";
  const geminiModel = process.env.NEXT_PUBLIC_GEMINI_MODEL ?? "gemini-2.0-flash";
  const togetherModel = process.env.NEXT_PUBLIC_TOGETHER_MODEL ?? "meta-llama/Llama-3.3-70B-Instruct-Turbo";
  const openRouterModel = process.env.NEXT_PUBLIC_OPENROUTER_MODEL;
  const grokModel = process.env.NEXT_PUBLIC_GROK_MODEL ?? "grok-3-mini";
  const groqModel = process.env.NEXT_PUBLIC_GROQ_MODEL ?? "llama-3.1-8b-instant";

  const baseLiveCandidates = React.useMemo(
    () =>
      buildLiveCandidates({
        geminiApiKey,
        geminiModel,
        togetherApiKey,
        togetherModel,
        openRouterApiKey,
        openRouterModel,
        grokApiKey,
        grokModel,
        groqApiKey,
        groqModel
      }),
    [
      geminiApiKey,
      geminiModel,
      togetherApiKey,
      togetherModel,
      openRouterApiKey,
      openRouterModel,
      grokApiKey,
      grokModel,
      groqApiKey,
      groqModel
    ]
  );

  const [rankedLiveCandidates, setRankedLiveCandidates] = React.useState<LiveCandidate[] | null>(null);
  const liveCandidates = rankedLiveCandidates ?? baseLiveCandidates;
  const isLiveEnabled = liveCandidates.length > 0;
  const primaryLiveProvider: LiveProvider = liveCandidates[0]?.provider ?? "groq";

  React.useEffect(() => {
    if (baseLiveCandidates.length <= 1) {
      setRankedLiveCandidates(baseLiveCandidates.length === 1 ? baseLiveCandidates : null);
      return;
    }
    if (shouldSkipLiveProviderBenchmark()) {
      setRankedLiveCandidates(null);
      return;
    }

    const fp = fingerprintLiveProviders(baseLiveCandidates);
    const stored = readStoredRank();
    if (
      stored &&
      stored.fingerprint === fp &&
      Date.now() - stored.measuredAt < LIVE_PROVIDER_RANK_TTL_MS
    ) {
      const fromCache = orderCandidatesFromStored(baseLiveCandidates, stored);
      if (fromCache) {
        setRankedLiveCandidates(fromCache);
        if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
          console.info("[live-ai] порядок провайдеров из кэша (мс)", stored.ms);
        }
        return;
      }
    }

    const ac = new AbortController();
    let cancelled = false;

    void (async () => {
      try {
        const { ordered, ms } = await benchmarkAndOrderLiveProviders({
          candidates: baseLiveCandidates,
          proxyUrl: liveProxyUrl,
          signal: ac.signal
        });
        if (cancelled) return;
        setRankedLiveCandidates(ordered);
        writeStoredRank({
          v: 1,
          fingerprint: fp,
          measuredAt: Date.now(),
          order: ordered.map((c) => c.provider),
          ms
        });
        if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
          console.info("[live-ai] замер скорости (мс, быстрее → выше в списке)", ms);
        }
      } catch {
        if (!cancelled) setRankedLiveCandidates(null);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [baseLiveCandidates, liveProxyUrl]);

  React.useEffect(() => {
    const saved = loadAssistantChatSession();
    if (saved && saved.length > 0) {
      skipPersistAfterRestore.current += 1;
      setMessages(saved);
    }
  }, []);

  React.useEffect(() => {
    if (skipPersistAfterRestore.current > 0) {
      skipPersistAfterRestore.current -= 1;
      return;
    }
    if (skipPersistAfterEmptyDismiss.current > 0 && messages.length === 0) {
      skipPersistAfterEmptyDismiss.current -= 1;
      return;
    }
    persistAssistantChatSession(messages);
  }, [messages]);

  React.useEffect(() => {
    if (authenticated) return;
    clearAssistantChatSession();
    setMessages(defaultChat);
    setInput("");
    setChipTags([...recentQueryChips]);
  }, [authenticated]);

  React.useEffect(() => {
    setShowMissedCard(!isMissedCallsSeen());
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const setPending = React.useCallback((v: boolean) => {
    aiReplyPendingRef.current = v;
    setAiReplyPending(v);
  }, []);

  const cancelPendingReply = React.useCallback(() => {
    if (replyTimeoutRef.current) {
      window.clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }
    liveAbortRef.current?.abort();
    liveAbortRef.current = null;
    sendSeqRef.current++;
    setPending(false);
    emitAiMetric({ type: "live_aborted", reason: "user_cancel" });
  }, [setPending]);

  React.useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        window.clearTimeout(replyTimeoutRef.current);
        replyTimeoutRef.current = null;
      }
      liveAbortRef.current?.abort();
      liveAbortRef.current = null;
      if (aiReplyPendingRef.current) {
        emitAiMetric({ type: "live_aborted", reason: "unmount" });
      }
    };
  }, []);

  React.useEffect(() => {
    const shouldSmooth = hasAutoScrolledOnRestoreRef.current && messages.length > prevMessagesLengthRef.current;
    chatEndRef.current?.scrollIntoView({ behavior: shouldSmooth ? "smooth" : "auto", block: "end" });
    hasAutoScrolledOnRestoreRef.current = true;
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  React.useEffect(() => {
    if (searchParams.get("reset") !== "1") return;
    clearAssistantChatSession();
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
    const raw = (text ?? input).trim();
    if (!raw) return;
    const validated = safeParseLiveUserPrompt(raw);
    if (!validated.ok) {
      setToast(validated.error);
      return;
    }
    const v = validated.value;
    if (/экспорт.*(лог|журнал)|скач.*(лог|журнал)/i.test(v)) {
      const ok = exportChatLogsToFile();
      setToast(ok ? "Журнал чата выгружен в JSON." : "Журнал пуст: пока нет сохраненных диалогов.");
      return;
    }

    if (replyTimeoutRef.current) {
      window.clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }
    liveAbortRef.current?.abort();
    liveAbortRef.current = null;
    const mySeq = ++sendSeqRef.current;

    const userMsg: ChatMessage = { id: id(), role: "user", text: v, createdAt: nowIso() };
    const baseThread = hydrateThreadIfEmptyInUi(messages);
    const threadAfterUser = [...baseThread, userMsg];
    setMessages(threadAfterUser);
    setInput("");
    setPending(true);

    replyTimeoutRef.current = window.setTimeout(async () => {
      replyTimeoutRef.current = null;
      const finishReply = () => {
        if (mySeq === sendSeqRef.current) setPending(false);
      };

      if (mySeq !== sendSeqRef.current) return;

      const w =
        typeof window !== "undefined"
          ? (window as unknown as { __E2E_ASSISTANT_DELAY_MS?: number }).__E2E_ASSISTANT_DELAY_MS
          : undefined;
      if (typeof w === "number" && w > 0 && v === "__E2E_SLOW__") {
        await new Promise<void>((r) => window.setTimeout(r, w));
        if (mySeq !== sendSeqRef.current) return;
      }

      const specialMock = resolveSpecialMockResponse(v);
      if (specialMock) {
        const resolved = toAiMessage({ ...specialMock, sourceLabel: getAiSourceLabel("special-mock", primaryLiveProvider) });
        setMessages((m) => [...m, resolved]);
        appendChatLog(v, resolved.text, "special-mock");
        traceAiSource(getAiSourceLabel("special-mock", primaryLiveProvider), v);
        finishReply();
        return;
      }

      const deterministic = resolveDeterministicResponse(v, runtimeInvoices);
      if (deterministic) {
        const resolved = toAiMessage({ ...deterministic, sourceLabel: getAiSourceLabel("deterministic", primaryLiveProvider) });
        setMessages((m) => {
          const next = [...m, resolved];
          if (resolved.navigateTo) persistAssistantChatSession(next);
          return next;
        });
        appendChatLog(v, resolved.text, "deterministic");
        traceAiSource(getAiSourceLabel("deterministic", primaryLiveProvider), v);
        if (resolved.navigateTo) {
          window.setTimeout(() => router.push(resolved.navigateTo!), 320);
        }
        finishReply();
        return;
      }

      const sessionMemory = resolveSessionMemoryResponse(
        v,
        threadAfterUser.filter((m) => m.role === "user").map((m) => m.text)
      );
      if (sessionMemory) {
        const resolved = toAiMessage({ ...sessionMemory, sourceLabel: getAiSourceLabel("session-memory", primaryLiveProvider) });
        setMessages((m) => [...m, resolved]);
        appendChatLog(v, resolved.text, "session-memory");
        traceAiSource(getAiSourceLabel("session-memory", primaryLiveProvider), v);
        finishReply();
        return;
      }

      let resolved: ChatMessage = toAiMessage({
        ...(isLiveEnabled ? buildSafeLiveFallbackResponse() : buildNoLiveKeysFallbackResponse()),
        sourceLabel: getAiSourceLabel(isLiveEnabled ? "fallback-no-live" : "no-live-keys", primaryLiveProvider)
      });
      let intentUsed = isLiveEnabled ? "fallback-no-live" : "no-live-keys";
      let resolvedLiveProvider: LiveProvider = primaryLiveProvider;

      try {
        if (isLiveEnabled) {
          const controller = new AbortController();
          liveAbortRef.current = controller;
          const abortMeta: { kind: "timeout" | "supersede" } = { kind: "supersede" };
          const timeout = window.setTimeout(() => {
            abortMeta.kind = "timeout";
            controller.abort();
          }, LIVE_FETCH_TIMEOUT_MS);
          try {
            const history: LiveAiMessage[] = threadAfterUser
              .slice(-6)
              .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));
            let liveResolved = false;
            let lastErrorLabel: string | null = null;
            const failureLabels: string[] = [];
            for (const candidate of liveCandidates) {
              resolvedLiveProvider = candidate.provider;
              try {
                const liveText = await getLiveAiText({
                  prompt: v,
                  history,
                  apiKey: candidate.apiKey,
                  model: candidate.model,
                  provider: candidate.provider,
                  proxyUrl: liveProxyUrl,
                  contextSummary: buildDataContextSummary(runtimeInvoices),
                  signal: controller.signal
                });
                if (mySeq !== sendSeqRef.current) return;
                if (!liveText) {
                  failureLabels.push(
                    `${liveProviderShort(candidate.provider)}: нет текста или ответ отклонён фильтром`
                  );
                  continue;
                }
                if (isLiveResponseReliable(v, liveText)) {
                  resolved = {
                    id: id(),
                    role: "ai",
                    text: liveText,
                    sourceLabel: getAiSourceLabel("live", candidate.provider),
                    createdAt: nowIso()
                  };
                } else {
                  resolved = {
                    id: id(),
                    role: "ai",
                    text: liveText,
                    sourceLabel: `${getLiveProviderLabel(candidate.provider)} (без строгой верификации)`,
                    createdAt: nowIso()
                  };
                }
                intentUsed = "live";
                liveResolved = true;
                break;
              } catch (e) {
                if (mySeq !== sendSeqRef.current) return;
                if (e instanceof DOMException && e.name === "AbortError") {
                  emitAiMetric({
                    type: "live_aborted",
                    reason: abortMeta.kind === "timeout" ? "timeout" : "new_message"
                  });
                  finishReply();
                  return;
                }
                lastErrorLabel = formatLiveErrorLabel(e, candidate.provider);
                failureLabels.push(lastErrorLabel);
              }
            }
            if (!liveResolved) {
              const baseFb = buildSafeLiveFallbackResponse();
              resolved = toAiMessage({
                ...baseFb,
                sourceLabel: ""
              });
              intentUsed = failureLabels.length > 0 || lastErrorLabel ? "live-error" : "live-unavailable";
            }
          } catch (e) {
            if (mySeq !== sendSeqRef.current) return;
            if (e instanceof DOMException && e.name === "AbortError") {
              emitAiMetric({
                type: "live_aborted",
                reason: abortMeta.kind === "timeout" ? "timeout" : "new_message"
              });
              finishReply();
              return;
            }
            resolved = toAiMessage({
              ...buildSafeLiveFallbackResponse(),
              sourceLabel: ""
            });
            intentUsed = "live-error";
          } finally {
            window.clearTimeout(timeout);
            if (liveAbortRef.current === controller) liveAbortRef.current = null;
          }
        }
      } catch {
        if (mySeq !== sendSeqRef.current) return;
      }

      if (mySeq !== sendSeqRef.current) return;

      setMessages((m) => {
        const next = [...m, resolved];
        if (resolved.navigateTo) persistAssistantChatSession(next);
        return next;
      });
      appendChatLog(v, resolved.text, intentUsed);
      traceAiSource(getAiSourceLabel(intentUsed, resolvedLiveProvider), v);
      if (resolved.navigateTo) {
        window.setTimeout(() => router.push(resolved.navigateTo!), 320);
      }
      finishReply();
    }, 120);
  };

  const hasChat = messages.length > 0;
  const visibleHeroCards = React.useMemo(() => {
    const cards: Array<"missed" | "weekly" | "assist"> = [];
    if (showMissedCard) cards.push("missed");
    if (showWeeklyCard) cards.push("weekly");
    if (showAiAssistCard) cards.push("assist");
    return cards;
  }, [showAiAssistCard, showMissedCard, showWeeklyCard]);
  const activeHeroCard = visibleHeroCards[heroCard] ?? null;
  const enterHeroOffset = heroTransitionDirection >= 0 ? 20 : -20;
  const exitHeroOffset = heroTransitionDirection >= 0 ? -20 : 20;

  React.useEffect(() => {
    if (heroCard >= visibleHeroCards.length) {
      setHeroCard(Math.max(0, visibleHeroCards.length - 1));
    }
  }, [heroCard, visibleHeroCards.length]);

  const moveHeroCard = (delta: number) => {
    if (visibleHeroCards.length < 2) return;
    setHeroTransitionDirection(delta);
    setHeroCard((prev) => {
      const next = prev + delta;
      if (next < 0) return 0;
      if (next >= visibleHeroCards.length) return visibleHeroCards.length - 1;
      return next;
    });
  };

  const onHeroPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    heroSwipeStartX.current = e.clientX;
  };
  const onHeroPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = heroSwipeStartX.current;
    heroSwipeStartX.current = null;
    if (start === null) return;
    const delta = e.clientX - start;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) moveHeroCard(1);
    if (delta > 0) moveHeroCard(-1);
  };
  const onHeroWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - heroWheelLastAt.current < 220) return;
    const horizontal = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(horizontal) < 28) return;
    heroWheelLastAt.current = now;
    if (horizontal > 0) moveHeroCard(1);
    if (horizontal < 0) moveHeroCard(-1);
  };

  return (
    <div className="space-y-4 pb-[140px]">
      {!hasChat ? (
        <>
          <div
            className="-mx-1 cursor-grab px-1 active:cursor-grabbing"
            data-testid="assistant-hero-swiper"
            onPointerDown={onHeroPointerDown}
            onPointerUp={onHeroPointerUp}
            onPointerCancel={() => {
              heroSwipeStartX.current = null;
            }}
            onWheel={onHeroWheel}
            style={{ touchAction: "pan-y" }}
          >
            <div className="relative h-[120px] overflow-hidden" data-testid="assistant-hero-slot">
              <AnimatePresence initial={false} custom={heroTransitionDirection} mode="wait">
                {activeHeroCard ? (
                  <motion.div
                    key={activeHeroCard}
                    initial={{ opacity: 0, x: enterHeroOffset }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: exitHeroOffset }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="h-full"
                  >
                    {activeHeroCard === "missed" ? (
                      <button
                        type="button"
                        className="block h-full w-full text-left"
                        onClick={() => {
                          markMissedCallsSeen();
                          setShowMissedCard(false);
                          router.push("/missed-calls/");
                        }}
                      >
                        <Card className="h-full rounded-[24px] border-[#E8EAED] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
                          <CardContent className="flex h-full items-center gap-3 pb-3 pt-3">
                            <span className="relative shrink-0">
                              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-slate-700">
                                <PhoneOff className="h-6 w-6 text-[#E53935]" />
                              </span>
                              <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#E53935] px-1 text-[11px] font-bold text-white">
                                x2
                              </span>
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <div className="mt-0.5 truncate text-[18px] font-semibold leading-tight text-[#1F2430] dark:text-slate-100">
                                  Доставка офисной техники
                                </div>
                                <span className="shrink-0 text-[12px] font-medium tabular-nums text-[#C3C7D4] dark:text-slate-400">
                                  12:42
                                </span>
                              </div>
                              <div className="mt-1 text-[14px] leading-tight text-[#7C8597] dark:text-slate-300">
                                Пропущенный
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    ) : null}
                    {activeHeroCard === "weekly" ? (
                      <Card className="h-full rounded-[20px] border-[#E5E7EE] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
                        <CardContent className="flex h-full items-center gap-3 overflow-hidden pb-2 pt-2">
                          <button
                            type="button"
                            className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full bg-[#ECEAFD]"
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
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              className="flex items-center gap-1 text-sm font-semibold text-[#343A4A] dark:text-slate-100"
                              onClick={() => {
                                setInput("звонки за неделю");
                                window.setTimeout(() => send("звонки за неделю"), 60);
                              }}
                            >
                              <Sparkles className="h-4 w-4 text-[#9C8AF2]" />
                              Еженедельный отчет
                            </button>
                            <div className="text-xs text-[#A2A8B8]">за 24 апреля</div>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#6B7280] dark:text-slate-300">
                              126 звонков, 6 пропущенных, средняя длительность 2:40. Есть 4 клиента в риске по оплате.
                            </p>
                            <button
                              type="button"
                              className="mt-1 text-xs font-semibold text-accent-dark underline dark:text-accent-yellow"
                              onClick={() => {
                                setInput("звонки за неделю");
                                window.setTimeout(() => send("звонки за неделю"), 60);
                              }}
                            >
                              Открыть в чате
                            </button>
                          </div>
                          <button
                            type="button"
                            className="shrink-0 rounded-full p-1 text-[#C7CBD6] hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={() => setShowWeeklyCard(false)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </CardContent>
                      </Card>
                    ) : null}
                    {activeHeroCard === "assist" ? (
                      <Card className="h-full rounded-[20px] border-[#DDE4FF] bg-gradient-to-br from-[#F7F9FF] to-white shadow-none dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
                        <CardContent className="flex h-full items-center gap-3 pb-3 pt-3">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECEAFD]">
                            <Bot className="h-4 w-4 text-[#4B5563]" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-[#343A4A] dark:text-slate-100">AI ассистенты подключены</div>
                            <div className="mt-0.5 text-xs leading-relaxed text-[#6B7280] dark:text-slate-300">
                              У вас подключены AI ассистенты, но вы ими еще не пользовались.
                            </div>
                            <button
                              type="button"
                              className="mt-1 rounded-full bg-accent-yellow px-4 py-1.5 text-xs font-semibold text-[#2F3141] transition hover:brightness-95"
                              onClick={() => {
                                setInput("Мои продукты");
                                window.setTimeout(() => send("Мои продукты"), 60);
                              }}
                            >
                              Начать
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            {visibleHeroCards.length > 1 ? (
              <div className="mt-2 flex justify-center gap-1.5">
                {visibleHeroCards.map((_, idx) => (
                  <button
                    key={`hero-dot-${idx}`}
                    type="button"
                    className={cn("h-1.5 w-5 rounded-full", heroCard === idx ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-300 dark:bg-slate-600")}
                    onClick={() => {
                      setHeroTransitionDirection(idx > heroCard ? 1 : -1);
                      setHeroCard(idx);
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-center px-1 pt-0.5 text-center">
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
            <h1 className="mt-2 max-w-[18rem] text-[26px] font-semibold leading-[1.15] tracking-tight text-[#212529] dark:text-slate-100">
              Ваш бизнес ассистент
            </h1>
            <p className="mt-1 text-[13px] text-[#8E8E93] dark:text-slate-400">{userProfile.legalName}</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex w-full max-w-[360px] justify-center gap-2">
              <button
                type="button"
                className={cn(pillBase, getCustomizationButtonClasses(missedChipCustom.dimmedDisabled))}
                disabled={missedChipCustom.dimmedDisabled}
                onClick={() => {
                  if (missedChipCustom.useMock) {
                    setToast("Пропущенные звонки (мок из кастомизации).");
                    return;
                  }
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
              <button
                type="button"
                className={cn(pillBase, getCustomizationButtonClasses(appealsChipCustom.dimmedDisabled))}
                disabled={appealsChipCustom.dimmedDisabled}
                onClick={() => {
                  if (appealsChipCustom.dimmedDisabled) return;
                  if (appealsChipCustom.useMock) {
                    setToast("Обращения (мок из кастомизации).");
                    return;
                  }
                  window.setTimeout(() => send("Обращения"), 60);
                }}
              >
                <span>Обращения</span>
              </button>
            </div>
            <div className="flex w-full max-w-[360px] flex-wrap justify-center gap-2">
              <button
                type="button"
                className={cn(pillBase, getCustomizationButtonClasses(invoicesChipCustom.dimmedDisabled))}
                disabled={invoicesChipCustom.dimmedDisabled}
                onClick={() => {
                  if (invoicesChipCustom.useMock) {
                    setToast("Мои счета (мок из кастомизации).");
                    return;
                  }
                  router.push("/invoices/");
                }}
              >
                <span>Мои счета</span>
              </button>
              <button
                type="button"
                className={cn(pillBase, getCustomizationButtonClasses(unpaidChipCustom.dimmedDisabled))}
                disabled={unpaidChipCustom.dimmedDisabled}
                onClick={() => {
                  if (unpaidChipCustom.useMock) {
                    setToast("Счета на оплату (мок из кастомизации).");
                    return;
                  }
                  router.push("/invoices/");
                }}
              >
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
            aria-label="Назад"
            className="mb-3 inline-flex items-center text-sm font-semibold text-[#3C4858] transition hover:text-[#212529] dark:text-slate-200 dark:hover:text-white"
            onClick={() => {
              if (shouldDelegateBackToHistory()) {
                router.back();
                return;
              }
              skipPersistAfterEmptyDismiss.current += 1;
              setMessages(defaultChat);
              setInput("");
              setToast(null);
              setChipTags([...recentQueryChips]);
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-slate-700">
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </span>
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
                  {m.role === "ai" && m.widget === "appeals-summary" ? (
                    <Card className="border-slate-200 dark:border-slate-700" data-testid="appeals-summary-widget">
                      <CardContent className="space-y-3 pb-3 pt-3">
                        <Button
                          type="button"
                          className="w-full rounded-xl bg-slate-900 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                          onClick={() => router.push(appealsListHref("assistant"))}
                        >
                          Создать обращение
                        </Button>
                        <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Активные обращения</div>
                          <div className="mt-2 space-y-2">
                            {chatAppeals.map((appeal) => (
                              <button
                                key={appeal.id}
                                type="button"
                                className="flex w-full items-center justify-between gap-2 text-left"
                                onClick={() => router.push(appealsListHref("assistant", { open: appeal.id }))}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm text-slate-900 dark:text-slate-100">{appeal.title}</div>
                                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                                    {appeal.category} — от {appeal.dateLabel}
                                  </div>
                                </div>
                                <span
                                  className={cn(
                                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                                    appeal.badgeLabel.includes("работе") &&
                                      "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
                                    appeal.badgeLabel.includes("подпис") &&
                                      "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                                  )}
                                >
                                  {appeal.badgeLabel}
                                </span>
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
                            onClick={() => router.push(appealsListHref("assistant"))}
                          >
                            Все обращения
                          </button>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          Для поиска конкретного обращения укажите: дату создания, номер договора или контекст обращения.
                        </p>
                        <Card className="border-slate-200 dark:border-slate-700">
                          <CardContent className="divide-y divide-slate-100 p-0 dark:divide-slate-700">
                            {[
                              { label: "Создать обращение", onClick: () => router.push(appealsListHref("assistant")) },
                              { label: "Список обращений", onClick: () => router.push(appealsListHref("assistant")) },
                              { label: "Выполненные", onClick: () => router.push(appealsListHref("assistant")) },
                              { label: "Отклонённые", onClick: () => router.push(appealsListHref("assistant")) }
                            ].map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-100"
                                onClick={item.onClick}
                              >
                                {item.label}
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              </button>
                            ))}
                          </CardContent>
                        </Card>
                        <div className="sr-only">
                          В работе: {inWorkAppealsCount}, ожидает подписания: {signPendingAppealsCount}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  {m.role === "ai" && m.widget === "subscription-balance-inline" ? (
                    <SubscriptionBalanceInlineWidget onToast={setToast} />
                  ) : null}
                  {m.role === "ai" && m.widget === "my-numbers-inline" ? <MyNumbersInlineWidget onToast={setToast} /> : null}

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
        <div className="fixed bottom-[122px] left-0 right-0 z-30 mx-auto w-full max-w-[430px]">
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

      {aiReplyPending ? (
        <div
          className="fixed bottom-[max(72px,env(safe-area-inset-bottom))] left-0 right-0 z-[60] mx-auto w-full max-w-[430px]"
          data-testid="assistant-reply-pending"
          role="status"
          aria-live="polite"
        >
          <div className="safe-px">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8EAED] bg-white px-3 py-2.5 shadow-md dark:border-slate-600 dark:bg-slate-800">
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#343A4A] dark:text-slate-100">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent-dark" aria-hidden />
                <span>Готовим ответ…</span>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 active:scale-[0.99] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                data-testid="assistant-cancel-reply"
                onClick={cancelPendingReply}
              >
                Отмена
              </button>
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
        inputDataTestId="assistant-chat-input"
        sendButtonDataTestId="assistant-send-button"
      />

      {toast ? (
        <div className="fixed bottom-[120px] left-0 right-0 z-40 mx-auto w-full max-w-[430px]">
          <div className="safe-px">
            <Card className="border-[#E8EAED] bg-white/75 shadow-lg backdrop-blur-xl backdrop-saturate-150 dark:border-slate-600 dark:bg-slate-900/75 dark:backdrop-blur-xl">
              <CardContent className="pb-3 pt-3">
                <div className="text-sm text-[#212529] dark:text-slate-100">{toast}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      <Modal open={openHistory} onClose={() => setOpenHistory(false)} title="История запросов">
        <div className="space-y-2">
          <div className="pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Быстрые запросы
          </div>
          <div className="flex flex-wrap gap-2 pb-1">
            {recentHistoryQuickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="rounded-full border border-[#E8EAED] bg-white px-3 py-1.5 text-xs font-medium text-[#3C4858] shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={() => {
                  setOpenHistory(false);
                  setInput(prompt);
                  window.setTimeout(() => send(prompt), 60);
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Сохраненные сессии
          </div>
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
