import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { SettingsScreen } from "@shared/components/screens/SettingsScreen";

export default function SettingsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="pb-24">
          <SettingsScreen appealsHref="/appeals/" backHref="/assistant/" />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
