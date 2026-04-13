import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { PageBackLink } from "@shared/components/PageBackLink";
import { MissedCallsListScreen } from "@shared/components/screens/MissedCallsListScreen";

export default function MissedCallsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-2">
          <PageBackLink />
          <MissedCallsListScreen />
        </div>
      </AppShell>
    </>
  );
}
