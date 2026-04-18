"use client";

import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { subscriptionBalanceChatMock } from "@shared/lib/mockData";

export function SubscriptionBalanceInlineWidget({ onToast }: { onToast?: (msg: string) => void }) {
  const m = subscriptionBalanceChatMock;
  return (
    <Card className="border-slate-200 dark:border-slate-700" data-testid="subscription-balance-widget">
      <CardContent className="space-y-3 pb-4 pt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Подписка</div>
        <div className="space-y-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>У вас подключена подписка – «{m.productName}»</p>
          <p>Стоимость – {m.priceRub.toLocaleString("ru-RU")} руб.</p>
          <p>Активна до {m.validUntilLabel}</p>
          <p className="text-slate-600 dark:text-slate-300">{m.renewalNote}</p>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" className="rounded-xl" onClick={() => onToast?.("Продление: демо-сценарий.")}>
            Продлить сейчас
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl dark:border-slate-600"
            onClick={() => onToast?.("Состав подписки: демо-сценарий.")}
          >
            Состав Подписки
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
