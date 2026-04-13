import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { InvoiceDetailClient } from "@shared/components/screens/InvoiceDetailClient";
import { allInvoiceIds } from "@shared/lib/mockData";

export function generateStaticParams() {
  return allInvoiceIds.map((id) => ({ id }));
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-2">
          <InvoiceDetailClient id={params.id} backHref="/invoices/" />
        </div>
      </AppShell>
    </>
  );
}
