import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { WidgetsScreen } from "@shared/components/screens/WidgetsScreen";

export default function WidgetsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-4">
          <WidgetsScreen />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
