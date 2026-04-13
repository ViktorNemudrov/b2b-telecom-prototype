"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Paperclip } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { Modal } from "@shared/components/ui/modal";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import {
  appealTopicOptions,
  filterAppealsBySearch,
  getAppealsFiltered,
  type AppealItem
} from "@shared/lib/mockData";

function AppealRow({ a, onOpen }: { a: AppealItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      className="flex w-full items-start justify-between gap-2 border-b border-slate-100 py-3 text-left last:border-0 dark:border-slate-700"
      onClick={onOpen}
    >
      <div>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{a.title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {a.category} · ID от {a.dateLabel}
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
          a.badgeLabel.includes("работе") && "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
          a.badgeLabel.includes("подпис") && "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
          a.badgeLabel === "Выполнено" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
          a.badgeLabel === "Отклонено" && "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200"
        )}
      >
        {a.badgeLabel}
      </span>
    </button>
  );
}

export function AppealsScreen() {
  const [filter, setFilter] = React.useState<"all" | "done" | "rejected">("all");
  const [expandedAll, setExpandedAll] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [topic, setTopic] = React.useState<string>(appealTopicOptions[0]?.title ?? "");
  const [body, setBody] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [attachedName, setAttachedName] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<AppealItem | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const baseList = getAppealsFiltered(filter);
  const searched = filterAppealsBySearch(baseList, search);
  const list = searched;
  const visible = filter === "all" && !expandedAll ? list.slice(0, 3) : list;

  const onSubmitAppeal = () => {
    if (!body.trim()) {
      openDevelopmentStub("Введите текст обращения перед отправкой.");
      return;
    }
    openDevelopmentStub(`Обращение отправлено (демо). Тема: «${topic}».`);
    setBody("");
    setAttachedName(null);
    setCreateOpen(false);
  };

  return (
    <div className="space-y-4 pb-6">
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Сейчас у вас: <span className="font-semibold">3 активных обращения</span>
        <br />
        В работе: 2 · Ожидает подписания: 1
      </p>

      <Button
        className="w-full rounded-2xl bg-slate-900 py-6 text-base font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
        onClick={() => setCreateOpen((v) => !v)}
      >
        Создать обращение
      </Button>

      {createOpen ? (
        <Card className="border-slate-200 dark:border-slate-600 dark:bg-slate-800/80">
          <CardContent className="space-y-3 pb-4 pt-4">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Тема</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {appealTopicOptions.map((o) => (
                <option key={o.title} value={o.title}>
                  {o.title} — {o.subtitle}
                </option>
              ))}
            </select>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Текст</label>
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Опишите запрос…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setAttachedName(f ? f.name : null);
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl dark:border-slate-600 dark:text-slate-200"
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                Прикрепить файл
              </Button>
              {attachedName ? (
                <span className="self-center text-xs text-slate-600 dark:text-slate-400">{attachedName}</span>
              ) : null}
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" className="flex-1 rounded-2xl" onClick={onSubmitAppeal}>
                Отправить
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Демо: данные не сохраняются.</p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="max-h-[min(420px,55vh)] overflow-y-auto border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
        <CardContent className="pb-2 pt-2">
          {visible.map((a) => (
            <AppealRow key={a.id} a={a} onOpen={() => setDetail(a)} />
          ))}
          {filter === "all" && list.length > 3 ? (
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-center gap-1 py-2 text-center text-sm font-semibold text-slate-700 dark:text-slate-200"
              onClick={() => setExpandedAll((v) => !v)}
            >
              {expandedAll ? (
                <>
                  Свернуть <ChevronDown className="h-4 w-4" />
                </>
              ) : (
                <>
                  Все обращения <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Поиск по обращениям</label>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Дата, договор, тема, статус…"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Укажите дату создания, номер договора или контекст — список отфильтруется.
        </p>
      </div>

      <Card className="dark:border-slate-700 dark:bg-slate-800/50">
        <CardContent className="divide-y divide-slate-100 p-0 dark:divide-slate-700">
          {(
            [
              ["Все обращения", "all" as const],
              ["Выполненные", "done" as const],
              ["Отклонённые", "rejected" as const]
            ] as const
          ).map(([label, key]) => (
            <button
              key={key}
              type="button"
              className={cn(
                "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-100",
                filter === key ? "bg-slate-50 dark:bg-slate-700/50" : ""
              )}
              onClick={() => {
                setFilter(key);
                setExpandedAll(key !== "all");
              }}
            >
              {label}
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </CardContent>
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? "Обращение"}>
        {detail ? (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold",
                  detail.badgeLabel.includes("работе") && "bg-sky-100 text-sky-800",
                  detail.badgeLabel.includes("подпис") && "bg-amber-100 text-amber-900",
                  detail.badgeLabel === "Выполнено" && "bg-emerald-100 text-emerald-800",
                  detail.badgeLabel === "Отклонено" && "bg-slate-200 text-slate-700"
                )}
              >
                {detail.badgeLabel}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {detail.category} · от {detail.dateLabel}
              </span>
            </div>
            <p className="leading-relaxed text-slate-800 dark:text-slate-200">{detail.description}</p>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">История</div>
              <ul className="mt-2 space-y-2 border-t border-slate-100 pt-2 dark:border-slate-600">
                {detail.history.map((h) => (
                  <li key={`${h.at}-${h.text.slice(0, 12)}`} className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium text-slate-500 dark:text-slate-400">{h.at}</span> — {h.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
