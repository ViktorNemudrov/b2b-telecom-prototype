import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { QaDiagnosticsScreen } from "@shared/components/screens/QaDiagnosticsScreen";

export default function QaPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="pb-24">
          <QaDiagnosticsScreen />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
