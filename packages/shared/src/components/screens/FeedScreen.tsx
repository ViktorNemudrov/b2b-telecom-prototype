"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, ChevronLeft, Search, Settings } from "lucide-react";
import { CommunicationLogRow } from "@shared/components/CommunicationLogRow";
import { DatePickerModal } from "@shared/components/DatePickerModal";
import { FeedItem } from "@shared/components/FeedItem";
import { SegmentedControl } from "@shared/components/SegmentedControl";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { communicationLogMock } from "@shared/lib/dashboardMock";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { feedDateLabel, feedItems } from "@shared/lib/mockData";

type CommTab = "records" | "secretary";
type FilterKey = "all" | "missed" | "incoming" | "reports" | "team";

export function FeedScreen({ leadingBack }: { leadingBack?: { href: string } }) {
  const [commTab, setCommTab] = React.useState<CommTab>("records");
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [date, setDate] = React.useState(() => new Date("2026-04-14T10:00:00.000Z"));
  const [openDatePicker, setOpenDatePicker] = React.useState(false);
  const [expandedTranscriptById, setExpandedTranscriptById] = React.useState<Record<string, boolean>>({});

  const filteredComm = React.useMemo(() => {
    if (commTab !== "records") return [];
    if (filter === "reports") return [];
    if (filter === "missed")
      return communicationLogMock.filter((r) => r.variant === "secretary" || r.variant === "waiting");
    if (filter === "incoming")
      return communicationLogMock.filter((r) => r.subtitle.includes("Входящий"));
    if (filter === "team") return communicationLogMock;
    return communicationLogMock;
  }, [commTab, filter]);

  const commGroups = React.useMemo(() => {
    const m = new Map<string, typeof communicationLogMock>();
    for (const row of filteredComm) {
      const g = row.dateGroup;
      if (!m.has(g)) m.set(g, []);
      m.get(g)!.push(row);
    }
    return Array.from(m.entries());
  }, [filteredComm]);

  const feedRest = React.useMemo(() => {
    if (commTab !== "records") return [];
    let list = feedItems.filter((i) => i.kind !== "call");
    if (filter === "missed" || filter === "incoming" || filter === "team") return list;
    if (filter === "reports") return list.filter((i) => i.kind === "tool" || i.kind === "summary");
    return list;
  }, [commTab, filter]);

  const commTabs = React.useMemo(
    () => [
      { key: "records" as const, label: "Записи" },
      { key: "secretary" as const, label: "Секретарь" }
    ],
    []
  );

  return (
    <div className="space-y-4 pb-6">
      {leadingBack ? (
        <div className="flex items-center gap-2">
          <Link
            href={leadingBack.href}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-softSm transition hover:brightness-95"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900">Коммуникация</h1>
            <button
              type="button"
              onClick={() => openDevelopmentStub("Настройки ленты коммуникаций.")}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-softSm transition hover:bg-slate-50"
              aria-label="Настройки"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{feedDateLabel}</p>
        </div>
      </div>

      <SegmentedControl value={commTab} options={commTabs} onChange={setCommTab} />

      {commTab === "records" ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openDevelopmentStub("Поиск по коммуникациям.")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-softSm transition hover:bg-slate-50 active:translate-y-[1px]"
              aria-label="Поиск"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpenDatePicker(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-softSm transition hover:bg-slate-50 active:translate-y-[1px]"
              aria-label="Календарь"
            >
              <Calendar className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("team");
                openDevelopmentStub("Фильтр «Команда» и привязка ответственных.");
              }}
              className={[
                "rounded-full border px-3 py-2 text-xs font-semibold transition active:translate-y-[1px]",
                filter === "team"
                  ? "border-transparent bg-accent-dark text-white shadow-softSm"
                  : "border-slate-200 bg-white text-slate-800 shadow-softSm hover:bg-slate-50"
              ].join(" ")}
            >
              Команда
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={[
                "rounded-full border px-3 py-2 text-xs font-semibold transition active:translate-y-[1px]",
                filter === "all"
                  ? "border-transparent bg-accent-dark text-white shadow-softSm"
                  : "border-slate-200 bg-white text-slate-800 shadow-softSm hover:bg-slate-50"
              ].join(" ")}
            >
              Все звонки
            </button>
            <button
              type="button"
              onClick={() => setFilter("missed")}
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition active:translate-y-[1px]",
                filter === "missed"
                  ? "border-transparent bg-accent-dark text-white shadow-softSm"
                  : "border-slate-200 bg-white text-slate-800 shadow-softSm hover:bg-slate-50"
              ].join(" ")}
            >
              Пропущенные
              <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">16</span>
            </button>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500">
            Доступное хранилище <span className="font-semibold text-slate-700">0.15%</span> · 1.5 МБ из 1 ГБ
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("incoming")}
              className={[
                "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition active:translate-y-[1px]",
                filter === "incoming"
                  ? "border-transparent bg-slate-800 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              Входящие
            </button>
            <button
              type="button"
              onClick={() => setFilter("reports")}
              className={[
                "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition active:translate-y-[1px]",
                filter === "reports"
                  ? "border-transparent bg-slate-800 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              Отчёты
            </button>
          </div>

          {filter !== "reports" ? (
            <Card>
              <CardContent className="px-2 pb-2 pt-1">
                {commGroups.map(([date, rows]) => (
                  <div key={date}>
                    <div className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {date}
                    </div>
                    <div className="divide-y divide-slate-100 px-2">
                      {rows.map((row) => (
                        <CommunicationLogRow key={row.id} row={row} />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <div className="space-y-3">
            {feedRest.map((item) => (
              <FeedItem
                key={item.id}
                item={item}
                expandedTranscript={!!expandedTranscriptById[item.id]}
                onToggleTranscript={(id) =>
                  setExpandedTranscriptById((p) => ({ ...p, [id]: !p[id] }))
                }
                onAction={(a) => {
                  if (a.type === "pay") openDevelopmentStub("Пополнение баланса и оплата из ленты.");
                  if (a.type === "report") openDevelopmentStub("Формирование отчёта из карточки ленты.");
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="pb-5 pt-5">
            <div className="text-sm font-semibold text-slate-900">Секретарь</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Принимает пропущенные, фиксирует суть и ставит задачи. В демо — заглушка; сценарии можно подключить к
              CRM.
            </p>
            <Button
              className="mt-4 w-full rounded-full"
              onClick={() => openDevelopmentStub("Мастер сценариев секретаря.")}
            >
              Настроить сценарии
            </Button>
          </CardContent>
        </Card>
      )}

      <DatePickerModal
        open={openDatePicker}
        onClose={() => setOpenDatePicker(false)}
        value={date}
        onChange={(d) => setDate(d)}
      />
    </div>
  );
}
