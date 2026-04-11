"use client";

import { BottomNav } from "@/components/layout/BottomNav";

export function AppShell({ children, showNav = true }: { children: React.ReactNode; showNav?: boolean }) {
  return (
    <div className={showNav ? "min-h-dvh pb-[88px]" : "min-h-dvh"}>
      {children}
      {showNav ? <BottomNav /> : null}
    </div>
  );
}
