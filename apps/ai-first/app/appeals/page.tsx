import { Suspense } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { AppealsBackLink } from "@shared/components/AppealsBackLink";
import { AppealsScreen } from "@shared/components/screens/AppealsScreen";

export default function AppealsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-2">
          <Suspense fallback={<div className="py-8 text-center text-sm text-slate-500">Загрузка…</div>}>
            <AppealsBackLink />
            <AppealsScreen />
          </Suspense>
        </div>
      </AppShell>
    </>
  );
}
