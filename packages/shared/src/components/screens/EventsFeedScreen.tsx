"use client";

import * as React from "react";
import Link from "next/link";
import { Pause, PhoneCall, PhoneOff, Play, Sparkles, X } from "lucide-react";
import { Card, CardContent } from "@shared/components/ui/card";
import { getCallById } from "@shared/lib/mockData";

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
  missed = false
}: {
  title: string;
  subtitle: string;
  time: string;
  tags: string[];
  missed?: boolean;
}) {
  return (
    <Card className="rounded-[22px] border-[#E5E7EE] bg-white shadow-none">
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
              <div className="text-xl font-semibold text-[#1F2430]">{title}</div>
              <div className="text-sm text-[#9CA3B5]">{subtitle}</div>
            </div>
          </div>
          <span className="text-xs text-[#C0C6D2]">{time}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[12px] text-[#2B6CE0]">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#F5F8FF] px-2.5 py-1">
              /{tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-between rounded-full border border-[#ECEEF3] bg-[#FAFBFD] px-3 py-2 text-sm text-[#A2A8B8]"
        >
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ECEEF3]">
              <Play className="h-3 w-3 text-[#4B5563]" />
            </span>
            Запись звонка
          </span>
          <span className="rounded-full border border-[#ECEEF3] px-2 text-xs">x1</span>
        </button>
      </CardContent>
    </Card>
  );
}

export function EventsFeedScreen() {
  const [dismissDaily, setDismissDaily] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);
  const chipsRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const dragRef = React.useRef<{ active: boolean; startX: number; startLeft: number }>({
    active: false,
    startX: 0,
    startLeft: 0
  });
  const c1 = getCallById("c1");
  const c2 = getCallById("c2");

  const updateChipShadows = React.useCallback(() => {
    const el = chipsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  React.useEffect(() => {
    updateChipShadows();
    const el = chipsRef.current;
    if (!el) return;
    const onScroll = () => updateChipShadows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateChipShadows]);

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

      <div className="relative">
        {canScrollLeft ? (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-1 left-0 top-0 z-10 w-5 bg-gradient-to-r from-[#F4F5FA] to-transparent"
          />
        ) : null}
        {canScrollRight ? (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-1 right-0 top-0 z-10 w-5 bg-gradient-to-l from-[#F4F5FA] to-transparent"
          />
        ) : null}
        <div
          ref={chipsRef}
          className={chipScroll}
          onPointerDown={(e) => {
            const el = chipsRef.current;
            if (!el) return;
            dragRef.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft };
            el.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const el = chipsRef.current;
            const drag = dragRef.current;
            if (!el || !drag.active) return;
            const dx = e.clientX - drag.startX;
            el.scrollLeft = drag.startLeft - dx;
          }}
          onPointerUp={() => {
            dragRef.current.active = false;
          }}
          onPointerCancel={() => {
            dragRef.current.active = false;
          }}
        >
          <div className={chipTrack}>
          <Link
            href="/missed-calls/"
            className="snap-start shrink-0 whitespace-nowrap rounded-full border border-[#E5E7EE] bg-white px-3 py-1.5 text-sm font-medium text-[#343A4A]"
          >
            Пропущенные <span className="ml-1 rounded-full bg-[#EB4A4A] px-1.5 text-[10px] text-white">6</span>
          </Link>
          <Link
            href="/assistant/"
            className="snap-start shrink-0 whitespace-nowrap rounded-full border border-[#E5E7EE] bg-gradient-to-r from-[#EFE9FF] to-[#F4F0FF] px-3 py-1.5 text-sm font-medium text-[#343A4A]"
          >
            ✨ Советы от Ассистента
          </Link>
          <Link
            href="/assistant/?q=%D0%BC%D0%BE%D0%B8%20%D1%81%D1%87%D0%B5%D1%82%D0%B0"
            className="snap-start shrink-0 whitespace-nowrap rounded-full border border-[#E5E7EE] bg-white px-3 py-1.5 text-sm font-medium text-[#343A4A]"
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
        />
      ) : null}
      {c1 ? (
        <FeedCallCard
          title={c1.title ?? "Доставка офисной техники"}
          subtitle="Пропущенный"
          time={c1.time}
          tags={["доставка в 14:20", "встретит Сергей", "A3530A190"]}
          missed
        />
      ) : null}

      <Card className="rounded-[22px] border-[#E5E7EE] bg-gradient-to-r from-[#FFECD9] via-[#EFE6FF] to-[#E8EDFF] shadow-none">
        <CardContent className="space-y-3 pb-4 pt-4">
          <div className="flex items-center gap-2 text-2xl font-semibold text-[#343A4A]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/75">
              ✦
            </span>
            Совет от Ассистента
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
            <div>
              <div className="text-xl font-semibold text-[#303646]">Пополните пакет минут</div>
              <div className="text-sm text-[#9AA0AF]">Осталось 25 минут</div>
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F3F7] text-xl text-[#2D3342]">
              +
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[22px] border-[#E5E7EE] bg-white shadow-none">
        <CardContent className="space-y-2 pb-4 pt-4">
          <div className="text-2xl font-semibold text-[#343A4A]">Остаток по тарифу</div>
          <div className="text-sm text-[#9AA0AF]">на 24 апреля</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] p-3">
              <div className="text-xl font-semibold text-[#303646]">3 435 гб</div>
            </div>
            <div className="rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] p-3">
              <div className="text-xl font-semibold text-[#303646]">1 545 мин</div>
            </div>
            <div className="col-span-2 rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] p-3">
              <div className="text-xl font-semibold text-[#303646]">800 sms</div>
            </div>
            <button className="rounded-2xl border border-[#ECEEF3] bg-[#F9FAFC] text-[#8E76F5]">💬</button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-[#E5E7EE] bg-white shadow-none">
        <CardContent className="flex items-center gap-3 pb-3 pt-3">
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECEAFD]">
            <Play className="h-4 w-4 text-[#4B5563]" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-sm font-semibold text-[#343A4A]">
              <Sparkles className="h-4 w-4 text-[#9C8AF2]" />
              Ежедневный отчет
            </div>
            <div className="text-xs text-[#A2A8B8]">за 24 апреля</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
