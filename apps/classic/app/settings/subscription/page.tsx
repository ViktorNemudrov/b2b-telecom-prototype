import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { SubscriptionManagementScreen } from "@shared/components/screens/SubscriptionManagementScreen";

export default function SubscriptionPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="pb-24">
          <SubscriptionManagementScreen backHref="/settings/" />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
