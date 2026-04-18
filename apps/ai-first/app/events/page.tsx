import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { PageBackLink } from "@shared/components/PageBackLink";
import { EventsFeedScreen } from "@shared/components/screens/EventsFeedScreen";

export default function EventsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-2">
          <PageBackLink />
          <EventsFeedScreen />
        </div>
      </AppShell>
    </>
  );
}
