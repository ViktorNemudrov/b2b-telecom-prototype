"use client";

import { ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { appealTopicOptions } from "@shared/lib/mockData";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

export function ClassicSupportScreen() {
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
