"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { TariffSubscriptionCard } from "@shared/components/TariffSubscriptionCard";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { getTariffFromFeed } from "@shared/lib/mockData";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  const tariff = getTariffFromFeed();

  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px space-y-4 pb-6 pt-2">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-dark px-4 py-2 text-xs font-semibold text-white shadow-softSm">
              <span className="text-accent-yellow">✓</span> Подписка
            </span>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">Связь для бизнеса</div>
            <div className="text-sm text-slate-500">ИП Балашов Владислав</div>
          </div>

          {tariff ? <TariffSubscriptionCard stats={tariff} /> : null}

          <Card>
            <CardContent className="pb-4 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900 dark:text-slate-100">Мобильная связь</span>
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">3 435 гб</div>
                  <div className="mt-2 h-16 rounded-lg bg-slate-100 dark:bg-slate-700" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800">
                    1 545 мин
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800">
                    800 sms
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm dark:border-slate-700"
                onClick={() => openDevelopmentStub("Подключенные номера.")}
              >
                Подключенные номера 3
                <ChevronRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full rounded-2xl border-dashed py-6"
            onClick={() => openDevelopmentStub("Добавить продукт.")}
          >
            <Plus className="h-5 w-5" /> Добавить новый продукт
          </Button>

          <Card>
            <CardContent className="pb-3 pt-4">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Помощник</div>
              <p className="mt-1 text-xs text-slate-500">Быстрый переход в AI-чат</p>
              <Link
                href="/assistant"
                className="mt-3 block rounded-2xl bg-slate-900 py-3 text-center text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Открыть ассистента
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
