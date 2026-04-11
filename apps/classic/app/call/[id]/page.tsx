import { CallDetailClient } from "@shared/components/screens/CallDetailClient";

export function generateStaticParams() {
  return [{ id: "c1" }];
}

export default function CallDetailPage({ params }: { params: { id: string } }) {
  return <CallDetailClient id={params.id} />;
}
