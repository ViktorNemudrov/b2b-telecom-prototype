"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { PageBackLink } from "@shared/components/PageBackLink";
import { ClassicDocumentsScreen } from "@shared/components/screens/ClassicDocumentsScreen";

export default function DocumentsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-4">
          <PageBackLink />
          <ClassicDocumentsScreen />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
