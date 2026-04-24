"use client";

import { ClassicAssistantNavSwipeContainer } from "@shared/components/ClassicAssistantNavSwipe";
import { ClassicNavBreadcrumbs } from "./ClassicNavBreadcrumbs";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ClassicAssistantNavSwipeContainer>
      {children}
      <ClassicNavBreadcrumbs />
    </ClassicAssistantNavSwipeContainer>
  );
}
