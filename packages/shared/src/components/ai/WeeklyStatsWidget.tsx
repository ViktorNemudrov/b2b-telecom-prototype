"use client";

import Link from "next/link";
import * as React from "react";
import { ChevronRight, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { followUpQuestionsWeekly, weeklyCallStatsMock } from "@shared/lib/mockData";

function DotChart() {
  const cols = 7;
  const rows = 6;
  const colors = ["bg-slate-700", "bg-amber-400", "bg-rose-500", "bg-accent-yellow"];
  return (
    <div className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const c = colors[i % colors.length];
        const h = (i % cols) / cols;
        return <div key={i} className={`aspect-square rounded-full ${h > 0.35 ? c : "bg-slate-200"}`} />;
      })}
    </div>
  );
}

export function WeeklyStatsWidget({
  variant,
  onExpandChange
}: {
  variant: "weekly-stats" | "weekly-stats-expanded";
  onExpandChange?: (expanded: boolean) => void;
}) {
  const [expanded, setExpanded] = React.useState(variant === "weekly-stats-expanded");
  const s = weeklyCallStatsMock;

  React.useEffect(() => {
    onExpandChange?.(expanded);
  }, [expanded, onExpandChange]);

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardContent className="space-y-3 pb-4 pt-4">
        <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
          Звонки за неделю
        </div>
        <div className="flex gap-2">
          <p className="flex-1 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
            За эту неделю у вас было <span className="font-semibold">{s.total}</span> звонков:{" "}
            <span className="font-semibold">{s.incoming}</span> входящих,{" "}
            <span className="font-semibold">{s.outgoing}</span> исходящих.
            <br />
            Бот принял всего <span className="font-semibold">{s.botIncoming}</span> входящих:{" "}
            <span className="font-semibold">{s.botClosed}</span> закрыт сразу,{" "}
            <span className="font-semibold">{s.botWaitingManager}</span> ждут обработки менеджером.
            <br />
            Средняя длительность разговора — {s.avgDuration}, а {s.peakNote}.
          </p>
          <button
            type="button"
            className="shrink-0 self-start rounded-full border border-slate-200 p-2 dark:border-slate-600"
            aria-label="Озвучить"
            onClick={() => openDevelopmentStub("Озвучивание сводки (демо).")}
          >
            <Volume2 className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Полезно">
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Не полезно">
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.chartLabel}</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </div>
          <DotChart />
          <p className="mt-2 text-xs text-slate-500">Срок хранения звонков — {s.storageDays} дней</p>
        </div>

        {!expanded ? (
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            onClick={() => setExpanded(true)}
          >
            Пропущенные звонки
          </button>
        ) : (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Пропущенные звонки</div>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              У вас 6 пропущенных звонков, которые требуется обработать.
            </p>
            <Link
              href="/missed-calls"
              className="inline-flex text-sm font-semibold text-accent-dark underline dark:text-accent-yellow"
            >
              Открыть список
            </Link>
          </div>
        )}

        <div className="rounded-2xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Последующие вопросы</div>
          <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-600">
            {followUpQuestionsWeekly.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-2.5 text-left text-sm text-slate-800 dark:text-slate-200"
                  onClick={() => openDevelopmentStub(`Раздел: ${q}`)}
                >
                  {q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
