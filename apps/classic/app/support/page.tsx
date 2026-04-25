"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicSupportScreen } from "@shared/components/screens/ClassicSupportScreen";

export default function SupportPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-2">
          <ClassicSupportScreen />
        </div>
      </AppShell>
    </>
  );
}
