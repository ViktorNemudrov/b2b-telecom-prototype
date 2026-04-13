import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { CallDetailClient } from "@shared/components/screens/CallDetailClient";
import { allCallIds } from "@shared/lib/mockData";

export function generateStaticParams() {
  return allCallIds.map((id) => ({ id }));
}

export default function CallDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-2">
          <CallDetailClient id={params.id} backHref="/assistant/" />
        </div>
      </AppShell>
    </>
  );
}
