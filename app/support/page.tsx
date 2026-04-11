import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-4">
          <h1 className="text-lg font-semibold text-slate-900">Поддержка</h1>
          <Card className="mt-4">
            <CardContent className="py-10 text-center text-sm text-slate-600">
              Раздел в разработке (демо-прототип).
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
