"use client";

import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

export default function SupportPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px space-y-4 pb-6 pt-4">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Поддержка</h1>
          <Card className="dark:border-slate-700">
            <CardContent className="space-y-4 py-6 text-sm text-slate-600 dark:text-slate-300">
              <p>Мои обращения — как в AI-ветке: статусы, создание и отбор.</p>
              <Link
                href="/appeals"
                className="block w-full rounded-2xl bg-slate-900 py-3 text-center text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Мои обращения
              </Link>
              <Button
                variant="outline"
                className="w-full rounded-2xl"
                onClick={() => openDevelopmentStub("Сценарий «Обратиться в чат»: очередь оператора (демо).")}
              >
                Обратиться в чат
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
