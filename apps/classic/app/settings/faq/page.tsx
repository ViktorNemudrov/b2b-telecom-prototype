import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { FaqVersionsScreen } from "@shared/components/screens/FaqVersionsScreen";

export default function SettingsFaqPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="pb-24">
          <FaqVersionsScreen backHref="/settings/" />
        </div>
      </AppShell>
    </>
  );
}
