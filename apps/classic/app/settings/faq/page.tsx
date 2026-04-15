import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { FaqVersionsScreen } from "@shared/components/screens/FaqVersionsScreen";

export default function SettingsFaqPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <FaqVersionsScreen backHref="/settings/" />
      </AppShell>
    </>
  );
}
