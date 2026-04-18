"use client";

import { ChevronRight, FileText, Folder } from "lucide-react";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

const folders = [
  { id: "f1", name: "Договоры", count: 12 },
  { id: "f2", name: "Счета и акты", count: 28 },
  { id: "f3", name: "Кадры", count: 5 }
] as const;

const files = [
  { id: "d1", name: "Договор оферты.pdf", date: "15.04.2026", size: "240 КБ" },
  { id: "d2", name: "Счёт на оплату №1042.pdf", date: "12.04.2026", size: "128 КБ" },
  { id: "d3", name: "Акт выполненных работ.pdf", date: "10.04.2026", size: "96 КБ" }
] as const;

export function ClassicDocumentsScreen() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Документы</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Папки и последние файлы (демо)</p>
      </div>

      <div className="space-y-2">
        {folders.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => openDevelopmentStub(`Папка «${f.name}» в разработке.`)}
            className="block w-full text-left"
          >
            <Card className="border-slate-200/80 transition hover:brightness-[1.02] dark:border-slate-700">
              <CardContent className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                  <Folder className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{f.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{f.count} файлов</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-500" aria-hidden />
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Недавние</h2>
      <div className="space-y-2">
        {files.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => openDevelopmentStub(`Открытие «${d.name}» в разработке.`)}
            className="block w-full text-left"
          >
            <Card className="border-slate-200/80 transition hover:brightness-[1.02] dark:border-slate-700">
              <CardContent className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{d.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {d.date} · {d.size}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-500" aria-hidden />
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
