"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pause, PhoneCall, PhoneOff, Play, Sparkles, X } from "lucide-react";
import { RecordingPlayer } from "@shared/components/RecordingPlayer";
import { Card, CardContent } from "@shared/components/ui/card";
import { getCallById } from "@shared/lib/mockData";
import { isMissedCallsSeen, markMissedCallsSeen } from "@shared/lib/runtimeFlags";

const dailyReportText =
  "Вчера пропущено 2 звонка, выручка по кассам +10%, баланс на 112 дней. Хорошего дня!";

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

  return (
    <Card className="rounded-[22px] border-[#E5E7EE] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
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
              <div className="text-xl font-semibold text-[#1F2430] dark:text-slate-100">{title}</div>
              <div className="text-sm text-[#9CA3B5] dark:text-slate-400">{subtitle}</div>
            </div>
          </div>
          <span className="text-xs text-[#C0C6D2] dark:text-slate-500">{time}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[12px] text-[#2B6CE0] dark:text-accent-yellow">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#F5F8FF] px-2.5 py-1 dark:bg-slate-700">
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
        <div className="rounded-xl border border-[#ECEEF3] bg-[#FBFCFF] px-3 py-2 dark:border-slate-600 dark:bg-slate-700">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA0AF] dark:text-slate-400">Расшифровка</div>
          <p
            className={`mt-1 whitespace-pre-line text-sm leading-relaxed text-[#4B5563] dark:text-slate-200 ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {transcript}
          </p>
          <button
            type="button"
            className="mt-1 text-xs font-medium text-[#2B6CE0] hover:underline"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Скрыть" : "Показать полностью"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export function EventsFeedScreen() {
  const router = useRouter();
  const [dismissDaily, setDismissDaily] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);
  const [missedSeen, setMissedSeen] = React.useState(() => isMissedCallsSeen());
  const c1 = getCallById("c1");
  const c2 = getCallById("c2");

  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="space-y-3 pb-6">
      {!dismissDaily ? (
        <Card className="rounded-[20px] border-[#E5E7EE] bg-white shadow-none">
          <CardContent className="flex items-center gap-3 pb-3 pt-3">
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECEAFD]"
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
              <div className="flex items-center gap-1 text-sm font-semibold text-[#343A4A]">
                <Sparkles className="h-4 w-4 text-[#9C8AF2]" />
                Ежедневный отчет
              </div>
              <div className="text-xs text-[#A2A8B8]">за 24 апреля</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{dailyReportText}</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full p-1 text-[#C7CBD6] hover:bg-slate-100"
              aria-label="Закрыть"
              onClick={() => setDismissDaily(true)}
            >
              <X className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      ) : null}

      <div>
        <div className={chipScroll}>
          <div className={chipTrack}>
            <Link
              href="/missed-calls/"
              onClick={() => {
                markMissedCallsSeen();
                setMissedSeen(true);
              }}
              className="snap-start shrink-0 whitespace-nowrap rounded-full border border-[#E5E7EE] bg-white px-3 py-1.5 text-sm font-medium text-[#343A4A] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              Пропущенные{" "}
              {!missedSeen ? (
                <span className="ml-1 rounded-full bg-[#EB4A4A] px-1.5 text-[10px] text-white">6</span>
              ) : null}
            </Link>
            <Link
              href="/assistant/?q=%D0%94%D0%B0%D0%B9%20%D1%81%D0%BE%D0%B2%D0%B5%D1%82%D1%8B%20%D0%BE%D1%82%20%D0%B0%D1%81%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BD%D1%82%D0%B0"
              className="snap-start shrink-0 whitespace-nowrap rounded-full border border-[#E5E7EE] bg-gradient-to-r from-[#EFE9FF] to-[#F4F0FF] px-3 py-1.5 text-sm font-medium text-[#343A4A] dark:border-slate-600 dark:from-violet-900/40 dark:to-slate-800 dark:text-slate-100"
            >
              ✨ Советы от Ассистента
            </Link>
            <Link
              href="/invoices/"
              className="snap-start shrink-0 whitespace-nowrap rounded-full border border-[#E5E7EE] bg-white px-3 py-1.5 text-sm font-medium text-[#343A4A] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              Счет на оплату
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-fit rounded-full bg-[#EEF0F4] px-3 py-1 text-xs text-[#A2A8B8]">сегодня</div>

      {c2 ? (
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
      {c1 ? (
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
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/75">
              ✦
            </span>
            Совет от Ассистента
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 dark:bg-slate-800">
            <div>
              <div className="text-xl font-semibold text-[#303646] dark:text-slate-100">Пополните пакет минут</div>
              <div className="text-sm text-[#9AA0AF] dark:text-slate-400">Осталось 25 минут</div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push("/assistant/?q=Как пополнить пакет минут");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F3F7] text-xl text-[#2D3342] dark:bg-slate-700 dark:text-slate-100"
            >
              +
            </button>
          </div>
        </CardContent>
      </Card>
      </div>

      <Card className="rounded-[22px] border-[#E5E7EE] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
        <CardContent className="space-y-2 pb-4 pt-4">
          <div className="text-2xl font-semibold text-[#343A4A] dark:text-slate-100">Остаток по тарифу</div>
          <div className="text-sm text-[#9AA0AF] dark:text-slate-400">на 24 апреля</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] p-3 dark:border-slate-600 dark:bg-slate-700">
              <div className="text-xl font-semibold text-[#303646] dark:text-slate-100">298 гб</div>
            </div>
            <div className="rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] p-3 dark:border-slate-600 dark:bg-slate-700">
              <div className="text-xl font-semibold text-[#303646] dark:text-slate-100">1 545 мин</div>
            </div>
            <div className="col-span-2 rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] p-3 dark:border-slate-600 dark:bg-slate-700">
              <div className="text-xl font-semibold text-[#303646] dark:text-slate-100">100 sms</div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/assistant/?q=%D0%9A%D0%B0%D0%BA%20%D0%BE%D0%BF%D1%82%D0%B8%D0%BC%D0%B8%D0%B7%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%20%D0%BE%D1%81%D1%82%D0%B0%D1%82%D0%BE%D0%BA%20%D0%BF%D0%B0%D0%BA%D0%B5%D1%82%D0%B0")}
              className="rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] text-[#8E76F5] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            >
              💬
            </button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
