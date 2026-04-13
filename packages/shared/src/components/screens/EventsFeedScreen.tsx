"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Sparkles, X } from "lucide-react";
import { RecordingPlayer } from "@shared/components/RecordingPlayer";
import { Card, CardContent } from "@shared/components/ui/card";
import { getCallById } from "@shared/lib/mockData";

const dailyReportText =
  "Вчера пропущено 2 звонка, выручка по кассам +10%, баланс на 112 дней. Хорошего дня!";

export function EventsFeedScreen() {
  const [dismissDaily, setDismissDaily] = React.useState(false);
  const c1 = getCallById("c1");

  return (
    <div className="space-y-4 pb-6">
      {!dismissDaily ? (
        <Card className="border-violet-200/60 bg-gradient-to-r from-violet-50/90 to-white dark:border-violet-900/40 dark:from-violet-950/40 dark:to-slate-900">
          <CardContent className="flex items-start gap-3 pb-4 pt-4">
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-softSm dark:bg-slate-800"
              aria-label="Проиграть отчёт"
            >
              <Play className="h-5 w-5 text-violet-600" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Sparkles className="h-4 w-4 text-violet-500" />
                Ежедневный отчёт
              </div>
              <div className="text-xs text-slate-500">за 24 апреля</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{dailyReportText}</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Закрыть"
              onClick={() => setDismissDaily(true)}
            >
              <X className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-softSm dark:bg-slate-800 dark:text-slate-100">
          Пропущенные <span className="ml-1 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">6</span>
        </span>
        <span className="shrink-0 rounded-full bg-gradient-to-r from-violet-100 to-indigo-50 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:from-violet-900/50 dark:to-indigo-900/30 dark:text-slate-100">
          ✨ Советы от Ассистента
        </span>
        <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800">
          Счета…
        </span>
      </div>

      {c1 ? (
        <Card className="dark:border-slate-700">
          <CardContent className="space-y-3 pb-4 pt-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {c1.title ?? "Звонок"}
                </div>
                <div className="text-xs text-rose-600">Пропущенный · {c1.time}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-sky-700 dark:text-sky-300">
              <span>/доставка в 14:20</span>
              <span>/встретит Сергей</span>
            </div>
            {c1.recordingUrl ? (
              <RecordingPlayer src={c1.recordingUrl} fileName="call.wav" layout="bar" centerLabel="Запись звонка" />
            ) : null}
            <Link
              href={`/call/${c1.id}`}
              className="inline-flex text-sm font-semibold text-accent-dark dark:text-accent-yellow"
            >
              Открыть карточку звонка
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
