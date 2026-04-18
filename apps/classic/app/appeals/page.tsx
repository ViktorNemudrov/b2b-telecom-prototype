import { Suspense } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { PageBackLink } from "@shared/components/PageBackLink";
import { AppealsScreen } from "@shared/components/screens/AppealsScreen";

export default function AppealsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-2">
          <PageBackLink href="/support/" />
          <Suspense fallback={<div className="py-8 text-center text-sm text-slate-500">Загрузка…</div>}>
            <AppealsScreen />
          </Suspense>
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
