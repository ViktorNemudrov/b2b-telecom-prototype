import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { OnboardingScreen } from "@shared/components/screens/OnboardingScreen";

export default function OnboardingPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="pb-24">
          <OnboardingScreen backHref="/settings/" />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
