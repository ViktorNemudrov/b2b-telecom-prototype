import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { NotificationsScreen } from "@shared/components/screens/NotificationsScreen";

export default function NotificationsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-2">
          <NotificationsScreen />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
