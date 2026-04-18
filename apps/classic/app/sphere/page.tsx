"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { PageBackLink } from "@shared/components/PageBackLink";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

export default function SpherePage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-4">
          <PageBackLink />
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Сфера</h1>
          <p className="mt-1 text-xs text-slate-500">PRO · демо</p>
          <Card className="mt-4">
            <CardContent className="space-y-4 py-10 text-center text-sm text-slate-600">
              <p>Раздел в разработке (демо-прототип).</p>
              <Button
                className="rounded-full"
                onClick={() => openDevelopmentStub("Карта точек продаж Сфера PRO.")}
              >
                Открыть карту (демо)
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
