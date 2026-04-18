"use client";

import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { myNumbersChatMock } from "@shared/lib/mockData";

export function MyNumbersInlineWidget({ onToast }: { onToast?: (msg: string) => void }) {
  return (
    <Card className="border-slate-200 dark:border-slate-700" data-testid="my-numbers-widget">
      <CardContent className="space-y-3 pb-4 pt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Номера</div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">У вас 3 номера:</p>
        <div className="space-y-3">
          {myNumbersChatMock.map((line, idx) => (
            <div
              key={line.phone}
              className="rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-3 text-sm dark:border-slate-600 dark:bg-slate-800/60"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {idx + 1}. {line.holder}
              </div>
              <div className="mt-1 font-mono text-slate-800 dark:text-slate-200">{line.phone}</div>
              <div className="mt-2 text-slate-700 dark:text-slate-300">
                Тариф: {line.tariff}
                <br />
                Остатки: {line.remainData}, {line.remainMinutes}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" className="rounded-xl" onClick={() => onToast?.("Покупка номера: демо-сценарий.")}>
            Купить номер
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl dark:border-slate-600"
            onClick={() => onToast?.("Смена тарифа: демо-сценарий.")}
          >
            Сменить тариф
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
