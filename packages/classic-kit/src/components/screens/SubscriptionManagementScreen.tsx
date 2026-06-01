"use client";

import { CenteredPageTitleBar } from "@shared/components/CenteredPageTitleBar";
import { Card, CardContent } from "@shared/components/ui/card";
import { ChevronRight } from "lucide-react";
import { subscriptionProductsMock } from "@shared/lib/mockData";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

export function SubscriptionManagementScreen({ backHref = "/settings/" }: { backHref?: string }) {
  return (
    <div className="safe-px mx-auto max-w-[760px] space-y-4 pb-8 pt-2">
      <CenteredPageTitleBar title="Управление подпиской" backHref={backHref} titleClassName="text-base font-semibold" />

      <Card className="border-[rgb(var(--border))]">
        <CardContent className="space-y-2 pb-4 pt-4">
          <p className="text-sm text-[rgb(var(--muted))]">
            В подписку входят следующие продукты:
          </p>
        </CardContent>
      </Card>

      <Card className="border-[rgb(var(--border))]">
        <CardContent className="pb-4 pt-4">
          <ul className="space-y-2">
            {subscriptionProductsMock.map((product) => (
              <li key={product}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-3 text-left text-sm text-[rgb(var(--text))] shadow-sm transition hover:bg-[rgb(var(--surface-2))]600800100 dark:hover:bg-[rgb(var(--surface-2))]/80"
                  onClick={() =>
                    openDevelopmentStub(`Раздел продукта «${product}» — демо-данные и настройки в разработке.`)
                  }
                >
                  <span className="font-medium">{product}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[rgb(var(--muted))]" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
