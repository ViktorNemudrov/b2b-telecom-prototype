"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { Button } from "@shared/components/ui/button";

export default function ContractsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px space-y-4 pb-6 pt-4">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Договоры</h1>
          <Card className="dark:border-slate-700">
            <CardContent className="space-y-3 py-8 text-center text-sm text-slate-600 dark:text-slate-300">
              <p>Раздел-заглушка: реестр договоров и сроки.</p>
              <Button className="rounded-full" onClick={() => openDevelopmentStub("Договоры (демо).")}>
                Открыть пример
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
