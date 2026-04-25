import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { FeedScreen } from "@shared/components/screens/FeedScreen";

export default function CommunicationPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-2">
          <FeedScreen leadingBack={{ href: "/widgets/" }} omitFeedBelowCalls />
        </div>
      </AppShell>
    </>
  );
}
