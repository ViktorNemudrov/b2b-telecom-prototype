import { Suspense } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { InvoiceDetailRouteClient } from "@shared/components/screens/InvoiceDetailRouteClient";
import { allInvoiceIds } from "@shared/lib/mockData";

export function generateStaticParams() {
  return allInvoiceIds.map((id) => ({ id }));
}

function InvoiceDetailFallback() {
  return <div className="safe-px py-6 text-sm text-slate-500">Загрузка…</div>;
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-2">
          <Suspense fallback={<InvoiceDetailFallback />}>
            <InvoiceDetailRouteClient id={params.id} />
          </Suspense>
        </div>
      </AppShell>
    </>
  );
}
