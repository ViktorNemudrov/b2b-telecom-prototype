import { AppShell } from "@/components/layout/AppShell";
import { FeedScreen } from "@/components/screens/FeedScreen";

export default function CommunicationPage() {
  return (
    <AppShell>
      <div className="safe-px pt-2">
        <FeedScreen leadingBack={{ href: "/" }} />
      </div>
    </AppShell>
  );
}
