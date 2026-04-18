import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { PageBackLink } from "@shared/components/PageBackLink";
import { HomeDashboardScreen } from "@shared/components/screens/HomeDashboardScreen";

export default function ServicesHomePage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-2">
          <PageBackLink />
          <HomeDashboardScreen />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
