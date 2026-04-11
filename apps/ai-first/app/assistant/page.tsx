import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { AssistantClient } from "@shared/components/AssistantClient";

export default function AssistantPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <AssistantClient />
      </AppShell>
    </>
  );
}
