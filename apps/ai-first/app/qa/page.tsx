import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { QaDiagnosticsScreen } from "@shared/components/screens/QaDiagnosticsScreen";

export default function QaPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <QaDiagnosticsScreen />
      </AppShell>
    </>
  );
}
