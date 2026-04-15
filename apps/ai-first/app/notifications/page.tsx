import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { NotificationsScreen } from "@shared/components/screens/NotificationsScreen";

export default function NotificationsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-2">
          <NotificationsScreen />
        </div>
      </AppShell>
    </>
  );
}
