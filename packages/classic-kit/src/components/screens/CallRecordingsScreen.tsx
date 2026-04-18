"use client";

import { Play, Search } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

const demoRows = [
  { id: "r1", phone: "+7 903 000-11-22", name: "Офис · входящий", when: "Сегодня, 14:32", len: "4:12" },
  { id: "r2", phone: "+7 495 111-22-33", name: "Поставщик канцтоваров", when: "Сегодня, 11:05", len: "12:40" },
  { id: "r3", phone: "+7 916 222-33-44", name: "Клиент · уточнение заказа", when: "Вчера, 18:20", len: "2:58" },
  { id: "r4", phone: "+7 903 000-11-22", name: "Исходящий · напоминание", when: "Вчера, 09:15", len: "6:01" },
  { id: "r5", phone: "8 800 555-35-35", name: "Горячая линия", when: "17 апр., 16:44", len: "8:33" }
] as const;

export function CallRecordingsScreen() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Записи разговоров</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Демо-список записей</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full border-slate-200 dark:border-slate-600"
          onClick={() => openDevelopmentStub("Поиск по записям в разработке.")}
          aria-label="Поиск"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Принято: 245
        </span>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Ждут ответа: 12
        </span>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-800 dark:bg-rose-900/30 dark:text-rose-200">
          Секретарь: 16
        </span>
      </div>

      <div className="space-y-2">
        {demoRows.map((row) => (
          <Card key={row.id} className="border-slate-200/80 dark:border-slate-700">
            <CardContent className="flex items-center gap-3 py-3">
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                onClick={() => openDevelopmentStub(`Воспроизведение записи «${row.name}» (демо).`)}
                aria-label={`Воспроизвести запись ${row.phone}`}
              >
                <Play className="h-4 w-4" fill="currentColor" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.name}</div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{row.phone}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{row.when}</span>
                  <span>{row.len}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
