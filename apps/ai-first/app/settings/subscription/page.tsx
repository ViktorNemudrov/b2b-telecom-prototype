import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { SubscriptionManagementScreen } from "@shared/components/screens/SubscriptionManagementScreen";

export default function SubscriptionPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <SubscriptionManagementScreen backHref="/settings/" />
      </AppShell>
    </>
  );
}
