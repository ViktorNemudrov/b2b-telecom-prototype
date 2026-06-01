"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Pause, PhoneCall, PhoneOff, Play, Sparkles, X } from "lucide-react";
import { RecordingPlayer } from "@shared/components/RecordingPlayer";
import { Card, CardContent } from "@shared/components/ui/card";
import { cn } from "@shared/components/ui/cn";
import { appealsListHref } from "@shared/lib/appealsBackFallback";
import { isBlockVisibleForFilter, type EventsFeedFilter } from "@shared/lib/eventsFeedFilter";
import { getAppealsFiltered, getCallById, missedCallsCount } from "@shared/lib/mockData";
import { isMissedCallsSeen, markMissedCallsSeen } from "@shared/lib/runtimeFlags";

const dailyReportText =
  "Вчера пропущен 1 звонок, выручка по кассам +10%, баланс на 112 дней. Хорошего дня!";

const chipScroll =
  "-mx-1 w-[calc(100%+8px)] overflow-x-auto overflow-y-hidden pb-1 pl-1 pr-1 [scrollbar-width:none] touch-pan-x [&::-webkit-scrollbar]:hidden";
const chipTrack = "inline-flex min-w-max snap-x snap-mandatory gap-2";

function FeedCallCard({
  title,
  subtitle,
  time,
  tags,
  recordingUrl,
  transcript,
  missed = false
}: {
  title: string;
  subtitle: string;
  time: string;
  tags: string[];
  recordingUrl?: string;
  transcript: string;
  missed?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const canExpand = transcript.trim().length > 140 || transcript.includes("\n");

  return (
    <Card className="rounded-[22px] border-[#E5E7EE] bg-white shadow-none dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))]">
      <CardContent className="space-y-3 pb-3 pt-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2F7]">
              {missed ? (
                <PhoneOff className="h-4 w-4 text-[#EB4A4A]" />
              ) : (
                <PhoneCall className="h-4 w-4 text-[#4A5568]" />
              )}
            </span>
            <div>
              <div className="text-xl font-semibold text-[#1F2430] dark:text-[rgb(var(--text))]">{title}</div>
              <div className="text-sm text-[#9CA3B5] dark:text-[rgb(var(--text))]">{subtitle}</div>
            </div>
          </div>
          <span className="text-xs text-[#C0C6D2] dark:text-[rgb(var(--text))]">{time}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[12px] text-[#2B6CE0] dark:text-accent-yellow">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#F5F8FF] px-2.5 py-1 dark:bg-[rgb(var(--surface-2))]">
              {tag}
            </span>
          ))}
        </div>

        {recordingUrl ? (
          <RecordingPlayer
            src={recordingUrl}
            fileName={`${title}.mp3`}
            layout="bar"
            centerLabel="Запись звонка"
            className="border-[#ECEEF3] bg-[#FAFBFD] p-2"
          />
        ) : null}
        <div className="rounded-xl border border-[#ECEEF3] bg-[#FBFCFF] px-3 py-2 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))]">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA0AF] dark:text-[rgb(var(--text))]">Расшифровка</div>
          <p
            className={`mt-1 whitespace-pre-line text-sm leading-relaxed text-[#4B5563] dark:text-[rgb(var(--text))] ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {transcript}
          </p>
          {canExpand ? (
            <button
              type="button"
              className="mt-1 text-xs font-medium text-[#2B6CE0] hover:underline"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Скрыть" : "Показать полностью"}
            </button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function useFeedHasVisibleContent(
  feedFilter: EventsFeedFilter,
  dismissDaily: boolean,
  c1: ReturnType<typeof getCallById>,
  c2: ReturnType<typeof getCallById>
) {
  return React.useMemo(() => {
    if (feedFilter === "all") return true;
    const v = isBlockVisibleForFilter;
    if (v(feedFilter, "dailyReport") && !dismissDaily) return true;
    if (v(feedFilter, "callRegular") && c2) return true;
    if (v(feedFilter, "callMissed") && c1) return true;
    if (v(feedFilter, "assistantAdvice")) return true;
    if (v(feedFilter, "tariffBalance")) return true;
    if (v(feedFilter, "appealsPanel")) return true;
    if (v(feedFilter, "appealsQuickLinks")) return true;
    return false;
  }, [feedFilter, dismissDaily, c1, c2]);
}

export function EventsFeedScreen({ showTitle = true }: { showTitle?: boolean }) {
  const router = useRouter();
  const [feedFilter, setFeedFilter] = React.useState<EventsFeedFilter>("all");
  const [dismissDaily, setDismissDaily] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);
  const [missedSeen, setMissedSeen] = React.useState(() => isMissedCallsSeen());
  const activeAppeals = React.useMemo(() => getAppealsFiltered("all").filter((a) => a.status === "active"), []);
  const inWorkAppealsCount = React.useMemo(() => activeAppeals.filter((a) => a.badgeLabel.includes("работе")).length, [activeAppeals]);
  const signPendingAppealsCount = React.useMemo(
    () => activeAppeals.filter((a) => a.badgeLabel.includes("подпис")).length,
    [activeAppeals]
  );
  const c1 = getCallById("c1");
  const c2 = getCallById("c2");

  const selectFilter = React.useCallback((next: Exclude<EventsFeedFilter, "all">) => {
    setFeedFilter((prev) => (prev === next ? "all" : next));
    if (next === "missed") {
      markMissedCallsSeen();
      setMissedSeen(true);
    }
  }, []);

  const hasVisibleContent = useFeedHasVisibleContent(feedFilter, dismissDaily, c1, c2);

  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const v = isBlockVisibleForFilter;

  return (
    <div className="space-y-3 pb-6">
      {showTitle ? (
        <h1 className="px-2 text-center text-lg font-bold leading-snug tracking-tight text-[#1F2430] dark:text-[rgb(var(--text))]">
          Лента событий
        </h1>
      ) : null}

      <div>
        <div className={chipScroll} data-no-assistant-nav-swipe role="toolbar" aria-label="Фильтры ленты">
          <div className={chipTrack}>
            <button
              type="button"
              onClick={() => selectFilter("missed")}
              className={cn(
                "snap-start shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition",
                feedFilter === "missed"
                  ? "border-[#2B6CE0] bg-[#F0F6FF] text-[#1d4ed8] dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-100"
                  : "border-[#E5E7EE] bg-white text-[#343A4A] dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))] dark:text-[rgb(var(--text))]"
              )}
              aria-pressed={feedFilter === "missed"}
              aria-label="Фильтр: пропущенные звонки"
            >
              Пропущенные{" "}
              {!missedSeen && missedCallsCount > 0 ? (
                <span className="ml-1 rounded-full bg-[#EB4A4A] px-1.5 text-[10px] text-white tabular-nums">
                  {missedCallsCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => selectFilter("tips")}
              className={cn(
                "snap-start shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition",
                feedFilter === "tips"
                  ? "border-violet-500 bg-violet-50 text-violet-950 dark:border-violet-500 dark:bg-violet-950/50 dark:text-violet-100"
                  : "border-[#E5E7EE] bg-gradient-to-r from-[#EFE9FF] to-[#F4F0FF] text-[#343A4A] dark:border-[rgb(var(--border))] dark:from-violet-900/40 dark:to-[rgb(var(--text))] dark:text-[rgb(var(--text))]"
              )}
              aria-pressed={feedFilter === "tips"}
              aria-label="Фильтр: советы от ассистента"
            >
              ✨ Советы от Ассистента
            </button>
            <button
              type="button"
              onClick={() => router.push("/invoices/")}
              className={cn(
                "snap-start shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition",
                feedFilter === "invoices"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100"
                  : "border-[#E5E7EE] bg-white text-[#343A4A] dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))] dark:text-[rgb(var(--text))]"
              )}
              aria-pressed={feedFilter === "invoices"}
              aria-label="Фильтр: счета на оплату"
            >
              Счет на оплату
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-fit rounded-full bg-[#EEF0F4] px-3 py-1 text-xs text-[#A2A8B8]">сегодня</div>

      {!hasVisibleContent && feedFilter !== "all" ? (
        <p className="px-2 text-center text-sm text-[#9AA0AF] dark:text-[rgb(var(--text))]">
          Нет событий по выбранному фильтру. Выберите другой фильтр или сбросьте, нажав активный чип ещё раз.
        </p>
      ) : null}

      {v(feedFilter, "dailyReport") && !dismissDaily ? (
        <Card className="rounded-[20px] border-[#E5E7EE] bg-white shadow-none dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))]">
          <CardContent className="flex items-center gap-3 pb-3 pt-3">
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECEAFD] dark:bg-violet-900/30"
              aria-label="Показать аудиозапись отчёта"
              onClick={() => {
                if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
                if (speaking) {
                  window.speechSynthesis.cancel();
                  setSpeaking(false);
                  return;
                }
                const u = new SpeechSynthesisUtterance(dailyReportText);
                u.lang = "ru-RU";
                u.onend = () => setSpeaking(false);
                u.onerror = () => setSpeaking(false);
                window.speechSynthesis.cancel();
                setSpeaking(true);
                window.speechSynthesis.speak(u);
              }}
            >
              {speaking ? (
                <Pause className="h-4 w-4 text-[#4B5563]" />
              ) : (
                <Play className="h-4 w-4 text-[#4B5563]" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-sm font-semibold text-[#343A4A] dark:text-[rgb(var(--text))]">
                <Sparkles className="h-4 w-4 text-[#9C8AF2]" />
                Ежедневный отчет
              </div>
              <div className="text-xs text-[#A2A8B8] dark:text-[rgb(var(--text))]">за 24 апреля</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6B7280] dark:text-[rgb(var(--text))]">{dailyReportText}</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full p-1 text-[#C7CBD6] hover:bg-[rgb(var(--surface-2))] dark:hover:bg-[rgb(var(--surface-2))]"
              aria-label="Закрыть"
              onClick={() => setDismissDaily(true)}
            >
              <X className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      ) : null}

      {v(feedFilter, "callRegular") && c2 ? (
        <FeedCallCard
          title={c2.title ?? "Цветы"}
          subtitle="Ответственный: Филатов"
          time={c2.time}
          tags={["ожидают договор к 18:00", "ответственный Андрей Карпов"]}
          recordingUrl={c2.recordingUrl}
          transcript={
            c2.transcript ??
            "Клиент подтвердил доставку цветов к 18:00. Ответственный Андрей Карпов просит прислать договор заранее."
          }
        />
      ) : null}
      {v(feedFilter, "callMissed") && c1 ? (
        <FeedCallCard
          title={c1.title ?? "Доставка офисной техники"}
          subtitle="Пропущенный"
          time={c1.time}
          tags={["доставка в 14:20", "встретит Сергей", "A3530A190"]}
          recordingUrl={c1.recordingUrl}
          transcript={
            c1.transcript ??
            "Клиент уточнил поставку офисной техники на 14:20. Встречает Сергей, просит предупредить за 30 минут до приезда."
          }
          missed
        />
      ) : null}
      {v(feedFilter, "assistantAdvice") ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => router.push("/assistant/?q=Дай советы от ассистента по пакету минут")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/assistant/?q=Дай советы от ассистента по пакету минут");
            }
          }}
          className="block w-full cursor-pointer text-left"
        >
          <Card className="rounded-[22px] border-[#E5E7EE] bg-gradient-to-r from-[#FFECD9] via-[#EFE6FF] to-[#E8EDFF] shadow-none">
            <CardContent className="space-y-3 pb-4 pt-4">
              <div className="flex items-center gap-2 text-2xl font-semibold text-[#343A4A]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/75">✦</span>
                Совет от Ассистента
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 dark:bg-[rgb(var(--surface-2))]">
                <div>
                  <div className="text-xl font-semibold text-[#303646] dark:text-[rgb(var(--text))]">Пополните пакет минут</div>
                  <div className="text-sm text-[#9AA0AF] dark:text-[rgb(var(--text))]">Осталось 25 минут</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/assistant/?q=Как пополнить пакет минут");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F3F7] text-xl text-[#2D3342] dark:bg-[rgb(var(--surface-2))] dark:text-[rgb(var(--text))]"
                >
                  +
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {v(feedFilter, "tariffBalance") ? (
        <Card className="rounded-[22px] border-[#E5E7EE] bg-white shadow-none dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))]">
          <CardContent className="space-y-2 pb-4 pt-4">
            <div className="text-2xl font-semibold text-[#343A4A] dark:text-[rgb(var(--text))]">Остаток по тарифу</div>
            <div className="text-sm text-[#9AA0AF] dark:text-[rgb(var(--text))]">на 24 апреля</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] p-3 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))]">
                <div className="text-xl font-semibold text-[#303646] dark:text-[rgb(var(--text))]">298 гб</div>
              </div>
              <div className="rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] p-3 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))]">
                <div className="text-xl font-semibold text-[#303646] dark:text-[rgb(var(--text))]">1 545 мин</div>
              </div>
              <div className="col-span-2 rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] p-3 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))]">
                <div className="text-xl font-semibold text-[#303646] dark:text-[rgb(var(--text))]">100 sms</div>
              </div>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/assistant/?q=%D0%9A%D0%B0%D0%BA%20%D0%BE%D0%BF%D1%82%D0%B8%D0%BC%D0%B8%D0%B7%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%20%D0%BE%D1%81%D1%82%D0%B0%D1%82%D0%BE%D0%BA%20%D0%BF%D0%B0%D0%BA%D0%B5%D1%82%D0%B0"
                  )
                }
                className="rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] text-[#8E76F5] dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))] dark:text-[rgb(var(--text))]"
              >
                💬
              </button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {v(feedFilter, "appealsPanel") ? (
        <Card className="rounded-[22px] border-[#E5E7EE] bg-[#F7F7FF] shadow-none dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))]/80">
          <CardContent className="space-y-3 pb-4 pt-4">
            <div className="text-2xl font-semibold text-[#343A4A] dark:text-[rgb(var(--text))]">Активные обращения</div>
            <p className="text-sm leading-relaxed text-[#4B5563] dark:text-[rgb(var(--text))]">
              На данный момент у вас: <span className="font-semibold">{activeAppeals.length} активных обращения</span>
              <br />- В работе: {inWorkAppealsCount} штуки
              <br />- Ожидает подписания: {signPendingAppealsCount} штука
            </p>
            <button
              type="button"
              onClick={() => router.push(appealsListHref("assistant"))}
              className="rounded-2xl bg-[#16181D] px-5 py-3 text-sm font-semibold text-white dark:bg-[rgb(var(--surface-2))] dark:text-[rgb(var(--text))]"
            >
              Создать обращение
            </button>

            <Card className="rounded-[18px] border-[#E5E7EE] bg-white shadow-none dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))]">
              <CardContent className="space-y-3 pb-3 pt-3">
                {activeAppeals.slice(0, 3).map((appeal) => (
                  <button
                    key={appeal.id}
                    type="button"
                    onClick={() => router.push(appealsListHref("assistant"))}
                    className="flex w-full items-center justify-between gap-2 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-medium text-[#1F2430] dark:text-[rgb(var(--text))]">{appeal.title}</div>
                      <div className="truncate text-sm text-[#9CA3B5] dark:text-[rgb(var(--text))]">
                        {appeal.category} — {appeal.id}
                      </div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          appeal.badgeLabel.includes("работе")
                            ? "bg-[#E8F1FF] text-[#2B6CE0] dark:bg-sky-900/40 dark:text-sky-200"
                            : "bg-[#FFF2DC] text-[#D97706] dark:bg-amber-900/40 dark:text-amber-200"
                        }`}
                      >
                        {appeal.badgeLabel}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#9CA3B5] dark:text-[rgb(var(--text))]" aria-hidden />
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => router.push(appealsListHref("assistant"))}
                  className="flex w-full items-center justify-center gap-1 text-sm font-medium text-[#343A4A] dark:text-[rgb(var(--text))]"
                >
                  Все обращения
                  <ChevronRight className="h-4 w-4 text-[#9CA3B5] dark:text-[rgb(var(--text))]" aria-hidden />
                </button>
              </CardContent>
            </Card>

            <p className="text-sm leading-relaxed text-[#4B5563] dark:text-[rgb(var(--text))]">
              Для поиска конкретного обращения укажите:
              <br />- Дату создания: точная дата, месяц или интервал
              <br />- Номер договора
              <br />- Контекст обращения
            </p>
          </CardContent>
        </Card>
      ) : null}

      {v(feedFilter, "appealsQuickLinks") ? (
        <Card className="rounded-[22px] border-[#E5E7EE] bg-white shadow-none dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--surface-2))]">
          <CardContent className="space-y-2 pb-2 pt-2">
            {["Создать обращение", "Список обращений", "Выполненные", "Отклонённые"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => router.push(appealsListHref("assistant"))}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-base text-[#1F2430] hover:bg-[#F7F8FB] dark:text-[rgb(var(--text))] dark:hover:bg-[rgb(var(--surface-2))]/40"
              >
                {item}
                <span className="text-[#9CA3B5] dark:text-[rgb(var(--text))]">›</span>
              </button>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
