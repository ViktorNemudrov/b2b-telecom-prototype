"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { PageBackLink } from "@shared/components/PageBackLink";
import { ClassicDocumentsFinanceScreen } from "@shared/components/screens/ClassicDocumentsFinanceScreen";

export default function DocumentsFinancePage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-2">
          <PageBackLink href="/documents/" className="mb-1.5" />
          <ClassicDocumentsFinanceScreen />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
