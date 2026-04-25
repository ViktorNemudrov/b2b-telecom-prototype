"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicDocumentsFinanceScreen } from "@shared/components/screens/ClassicDocumentsFinanceScreen";

export default function DocumentsFinancePage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-2">
          <ClassicDocumentsFinanceScreen />
        </div>
      </AppShell>
    </>
  );
}
