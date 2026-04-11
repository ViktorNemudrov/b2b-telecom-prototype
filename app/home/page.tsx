import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { HomeDashboardScreen } from "@/components/screens/HomeDashboardScreen";

export default function ServicesHomePage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-2">
          <HomeDashboardScreen />
        </div>
      </AppShell>
    </>
  );
}
