"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ActionCard } from "@/components/ActionCard";
import { BottomInputBar } from "@/components/BottomInputBar";
import { ChatBubble } from "@/components/ChatBubble";
import { PromptTag } from "@/components/PromptTag";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import {
  chatHistoryPresets,
  defaultChat,
  quickPrompts,
  userProfile,
  type ChatMessage
} from "@/lib/mockData";

function id() {
  return Math.random().toString(16).slice(2);
}

function nowIso() {
  return new Date().toISOString();
}

function mockAiResponse(prompt: string): ChatMessage {
  const p = prompt.toLowerCase();

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

  return {
    id: id(),
    role: "ai",
    text:
      "Принял(а). Уточни, пожалуйста, что важнее: скорость (быстрый ответ) или точность (сверка по источникам)?",
    createdAt: nowIso(),
    suggested: ["Быстро", "Точно", "Сбалансировано"]
  };
}

export function AiAssistantScreen() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(defaultChat);
  const [input, setInput] = React.useState("");
  const [openHistory, setOpenHistory] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const send = (text?: string) => {
    const v = (text ?? input).trim();
    if (!v) return;

    const userMsg: ChatMessage = { id: id(), role: "user", text: v, createdAt: nowIso() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    window.setTimeout(() => {
      const ai = mockAiResponse(v);
      setMessages((m) => [...m, ai]);
    }, 350);
  };

  const hasChat = messages.length > 0;

  return (
    <div className="space-y-4 pb-6">
      <div>
        <div className="text-lg font-semibold text-slate-900">AI-команда</div>
        <div className="text-xl font-semibold text-slate-900">Доброе утро, {userProfile.name}</div>
        <div className="mt-1 text-sm text-slate-500">С чего мы начнём?</div>
      </div>

      <BottomInputBar
        placement="inline"
        value={input}
        onChange={setInput}
        onSend={() => send()}
        onOpenHistory={() => setOpenHistory(true)}
      />

      <div className="grid grid-cols-3 gap-2 pb-1">
        {quickPrompts.map((p) => (
          <PromptTag
            key={p}
            label={p}
            onClick={() => {
              setInput(p);
              window.setTimeout(() => send(p), 120);
            }}
          />
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {!hasChat ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Card className="bg-[#FAFAFC]">
                <CardContent className="pb-5 pt-5">
                  <div className="text-sm font-semibold text-slate-900">Интеллектуальный центр</div>
                  <div className="mt-1 text-sm text-slate-700">
                    Задай вопрос или выбери быстрый сценарий — я предложу действия и подготовлю черновики.
                  </div>
                  <div className="mt-4 grid gap-2">
                    <button
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-softSm transition hover:bg-slate-50 active:translate-y-[1px]"
                      onClick={() => send("Сводка дня")}
                    >
                      <div className="text-sm font-semibold text-slate-900">Сводка дня</div>
                      <div className="mt-1 text-xs text-slate-500">Пропущенные, риски, приоритеты на сегодня</div>
                    </button>
                    <button
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-softSm transition hover:bg-slate-50 active:translate-y-[1px]"
                      onClick={() => send("Запусти рассылку")}
                    >
                      <div className="text-sm font-semibold text-slate-900">Запуск рассылки</div>
                      <div className="mt-1 text-xs text-slate-500">Подготовка текста + сегмента + очереди отправки</div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {toast ? (
        <div className="fixed bottom-24 left-0 right-0 z-40 mx-auto w-full max-w-[430px]">
          <div className="safe-px">
            <Card className="border-slate-200">
              <CardContent className="pb-3 pt-3">
                <div className="text-sm text-slate-800">{toast}</div>
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
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-softSm transition hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => {
                setMessages(h.messages);
                setOpenHistory(false);
                setToast(`Загружено: «${h.title}».`);
              }}
            >
              <div className="text-sm font-semibold text-slate-900">{h.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-slate-500">{h.preview}</div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

