import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsScreen } from "@shared/components/screens/SettingsScreen";

export default function SettingsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <SettingsScreen appealsHref="/appeals" backHref="/" />
      </AppShell>
    </>
  );
}
