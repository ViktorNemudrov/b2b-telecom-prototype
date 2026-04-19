"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { PageBackLink } from "@shared/components/PageBackLink";
import { ClassicSupportScreen } from "@shared/components/screens/ClassicSupportScreen";

export default function SupportPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-2">
          <PageBackLink className="mb-1.5" />
          <ClassicSupportScreen />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
