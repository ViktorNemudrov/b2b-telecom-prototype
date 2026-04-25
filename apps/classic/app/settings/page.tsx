import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsScreen } from "@shared/components/screens/SettingsScreen";

export default function SettingsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="pb-24">
          <SettingsScreen backHref="/assistant/" />
        </div>
      </AppShell>
    </>
  );
}
