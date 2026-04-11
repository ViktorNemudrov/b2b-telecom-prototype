"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { openDevelopmentStub } from "@/lib/developmentStub";

export default function DocumentsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-4">
          <h1 className="text-lg font-semibold text-slate-900">Документы</h1>
          <Card className="mt-4">
            <CardContent className="space-y-4 py-10 text-center text-sm text-slate-600">
              <p>Раздел в разработке (демо-прототип).</p>
              <Button
                className="rounded-full"
                onClick={() => openDevelopmentStub("Список документов и примеры файлов.")}
              >
                Показать примеры
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
