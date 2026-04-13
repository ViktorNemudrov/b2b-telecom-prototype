"use client";

import * as React from "react";
import { ChevronRight, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { cn } from "@shared/components/ui/cn";
import { appealTopicOptions, getAppealsFiltered, type AppealItem } from "@shared/lib/mockData";

function AppealRow({ a }: { a: AppealItem }) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-slate-100 py-3 last:border-0 dark:border-slate-700">
      <div>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{a.title}</div>
        <div className="text-xs text-slate-500">
          {a.category} · ID от {a.dateLabel}
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
          a.badgeLabel.includes("работе") && "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
          a.badgeLabel.includes("подпис") && "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
          a.badgeLabel === "Выполнено" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
          a.badgeLabel === "Отклонено" && "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
        )}
      >
        {a.badgeLabel}
      </span>
    </div>
  );
}

export function AppealsScreen() {
  const [filter, setFilter] = React.useState<"all" | "done" | "rejected">("all");
  const [expandedAll, setExpandedAll] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [topic, setTopic] = React.useState<string>(appealTopicOptions[0]?.title ?? "");
  const [body, setBody] = React.useState("");

  const list = getAppealsFiltered(filter);
  const visible = filter === "all" && !expandedAll ? list.slice(0, 3) : list;

  return (
    <div className="space-y-4 pb-6">
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Сейчас у вас: <span className="font-semibold">3 активных обращения</span>
        <br />
        В работе: 2 · Ожидает подписания: 1
      </p>

      <Button className="w-full rounded-2xl bg-slate-900 py-6 text-base font-semibold text-white dark:bg-slate-100 dark:text-slate-900" onClick={() => setCreateOpen((v) => !v)}>
        Создать обращение
      </Button>

      {createOpen ? (
        <Card className="dark:border-slate-700">
          <CardContent className="space-y-3 pb-4 pt-4">
            <label className="text-xs font-semibold text-slate-500">Тема</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {appealTopicOptions.map((o) => (
                <option key={o.title} value={o.title}>
                  {o.title} — {o.subtitle}
                </option>
              ))}
            </select>
            <label className="text-xs font-semibold text-slate-500">Текст</label>
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              placeholder="Опишите запрос…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-[11px] text-slate-500">Демо: данные не сохраняются.</p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="dark:border-slate-700">
        <CardContent className="pb-2 pt-2">
          {visible.map((a) => (
            <AppealRow key={a.id} a={a} />
          ))}
          {filter === "all" && !expandedAll && list.length > 3 ? (
            <button
              type="button"
              className="mt-2 w-full py-2 text-center text-sm font-semibold text-slate-700 dark:text-slate-200"
              onClick={() => setExpandedAll(true)}
            >
              Все обращения <ChevronRight className="inline h-4 w-4" />
            </button>
          ) : null}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-500">
        Для поиска укажите дату создания, номер договора или контекст обращения.
      </p>
      <div className="flex gap-2">
        <ThumbsUp className="h-4 w-4 text-slate-400" />
        <ThumbsDown className="h-4 w-4 text-slate-400" />
      </div>

      <Card className="dark:border-slate-700">
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
                "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium",
                filter === key ? "bg-slate-50 dark:bg-slate-800" : ""
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
    </div>
  );
}
