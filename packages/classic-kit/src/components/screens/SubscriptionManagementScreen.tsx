"use client";

import { PageBackLink } from "@shared/components/PageBackLink";
import { Card, CardContent } from "@shared/components/ui/card";
import { ChevronRight } from "lucide-react";
import { subscriptionProductsMock } from "@shared/lib/mockData";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

export function SubscriptionManagementScreen({ backHref = "/settings/" }: { backHref?: string }) {
  return (
    <div className="safe-px mx-auto max-w-[760px] space-y-4 pb-8 pt-2">
      <PageBackLink href={backHref} />

      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="space-y-2 pb-4 pt-4">
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">Управление подпиской</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            В подписку входят следующие продукты:
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="pb-4 pt-4">
          <ul className="space-y-2">
            {subscriptionProductsMock.map((product) => (
              <li key={product}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700/80"
                  onClick={() =>
                    openDevelopmentStub(`Раздел продукта «${product}» — демо-данные и настройки в разработке.`)
                  }
                >
                  <span className="font-medium">{product}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
