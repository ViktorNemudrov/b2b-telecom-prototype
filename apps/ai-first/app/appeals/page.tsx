import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { AppealsScreen } from "@shared/components/screens/AppealsScreen";

export default function AppealsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-2">
          <AppealsScreen />
        </div>
      </AppShell>
    </>
  );
}
