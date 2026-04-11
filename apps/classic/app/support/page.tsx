"use client";

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
        <div className="safe-px pt-4">
          <h1 className="text-lg font-semibold text-slate-900">Поддержка</h1>
          <Card className="mt-4">
            <CardContent className="space-y-4 py-10 text-center text-sm text-slate-600">
              <p>Раздел в разработке (демо-прототип).</p>
              <Button
                className="rounded-full"
                onClick={() => openDevelopmentStub("Чат с поддержкой и очередь обращений.")}
              >
                Написать в чат
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
