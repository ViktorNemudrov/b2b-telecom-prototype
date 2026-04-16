"use client";

import { PageBackLink } from "@shared/components/PageBackLink";
import { Card, CardContent } from "@shared/components/ui/card";

const productsInSubscription = [
  "Сотовая связь",
  "Запись разговоров",
  "Секретарь",
  "Этикетка",
  "ИИ-ассистенты",
  "Продвижение",
  "Прием платежей",
  "Конструктор сайтов"
];

export function SubscriptionManagementScreen({ backHref = "/settings/" }: { backHref?: string }) {
  return (
    <div className="safe-px mx-auto max-w-[760px] space-y-4 pb-8 pt-2">
      <PageBackLink href={backHref} />

      <Card>
        <CardContent className="space-y-2 pb-4 pt-4">
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">Управление подпиской</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            В подписку входят следующие продукты:
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pb-4 pt-4">
          <ul className="space-y-2">
            {productsInSubscription.map((product) => (
              <li
                key={product}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {product}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
