"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { PageBackLink } from "@shared/components/PageBackLink";
import { CallRecordingsScreen } from "@shared/components/screens/CallRecordingsScreen";

export default function CallRecordingsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-2">
          <PageBackLink href="/widgets/" />
          <CallRecordingsScreen />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
