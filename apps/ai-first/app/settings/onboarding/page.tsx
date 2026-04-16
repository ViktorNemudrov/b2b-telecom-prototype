import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { OnboardingScreen } from "@shared/components/screens/OnboardingScreen";

export default function OnboardingPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <OnboardingScreen backHref="/settings/" />
      </AppShell>
    </>
  );
}
