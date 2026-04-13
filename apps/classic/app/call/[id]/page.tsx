import { CallDetailClient } from "@shared/components/screens/CallDetailClient";
import { allCallIds } from "@shared/lib/mockData";

export function generateStaticParams() {
  return allCallIds.map((id) => ({ id }));
}

export default function CallDetailPage({ params }: { params: { id: string } }) {
  return <CallDetailClient id={params.id} backHref="/communication" />;
}
