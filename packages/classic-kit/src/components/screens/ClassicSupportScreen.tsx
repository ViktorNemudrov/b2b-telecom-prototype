"use client";

import Link from "next/link";
import * as React from "react";
import { ChevronRight, ClipboardList, MessageCircle } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { cn } from "@shared/components/ui/cn";
import { appealTopicOptions, getAppealsFiltered } from "@shared/lib/mockData";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

export function ClassicSupportScreen() {
  const allAppeals = React.useMemo(() => getAppealsFiltered("all"), []);
  const activeAppeals = React.useMemo(() => allAppeals.filter((a) => a.status === "active"), [allAppeals]);
  const inWorkCount = React.useMemo(() => activeAppeals.filter((a) => a.badgeLabel.includes("работе")).length, [activeAppeals]);
  const signPendingCount = React.useMemo(
    () => activeAppeals.filter((a) => a.badgeLabel.includes("подпис")).length,
    [activeAppeals]
  );
  const previewAppeals = activeAppeals.slice(0, 3);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Поддержка</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Выберите тему или напишите нам (демо)</p>
      </div>

      <Button
        type="button"
        className="w-full rounded-full bg-accent-dark py-6 text-base font-semibold text-white shadow-softSm"
        onClick={() => openDevelopmentStub("Чат с поддержкой в разработке.")}
      >
        <MessageCircle className="mr-2 h-5 w-5" aria-hidden />
        Написать в чат
      </Button>

      <Link
        href="/appeals/"
        data-testid="support-appeals-card"
        className="block rounded-2xl outline-none ring-offset-2 ring-offset-white transition hover:brightness-[1.01] focus-visible:ring-2 focus-visible:ring-accent-yellow dark:ring-offset-slate-900"
      >
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="space-y-3 pb-4 pt-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                <ClipboardList className="h-5 w-5 text-slate-700 dark:text-slate-200" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Обращения</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Активных: {activeAppeals.length}. В работе: {inWorkCount}
                  {signPendingCount ? ` · Ожидает подписания: ${signPendingCount}` : ""}
                </p>
              </div>
            </div>

            {previewAppeals.length ? (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-slate-700 dark:border-slate-600">
                {previewAppeals.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between gap-2 px-3 py-2.5 dark:text-slate-100"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">{a.title}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                        {a.category} · ID от {a.dateLabel}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        a.badgeLabel.includes("работе") && "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
                        a.badgeLabel.includes("подпис") && "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                      )}
                    >
                      {a.badgeLabel}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-softSm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
              Список обращений
              <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
            </div>
          </CardContent>
        </Card>
      </Link>

      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Популярные темы</h2>
      <div className="space-y-2">
        {appealTopicOptions.map((t, i) => (
          <button
            key={`${t.title}-${i}`}
            type="button"
            onClick={() => openDevelopmentStub(`Тема «${t.title}» — раздел в разработке.`)}
            className="block w-full text-left"
          >
            <Card className="border-slate-200/80 transition hover:brightness-[1.02] dark:border-slate-700">
              <CardContent className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{t.subtitle}</div>
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
