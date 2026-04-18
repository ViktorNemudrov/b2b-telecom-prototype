"use client";

import { ClassicAssistantNavSwipeContainer } from "@shared/components/ClassicAssistantNavSwipe";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <ClassicAssistantNavSwipeContainer>{children}</ClassicAssistantNavSwipeContainer>;
}
