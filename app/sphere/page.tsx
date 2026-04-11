import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function SpherePage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-4">
          <h1 className="text-lg font-semibold text-slate-900">Сфера</h1>
          <p className="mt-1 text-xs text-slate-500">PRO · демо</p>
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
