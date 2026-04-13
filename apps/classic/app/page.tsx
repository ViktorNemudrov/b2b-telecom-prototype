import { Suspense } from "react";
import { ClassicHomeClient } from "@/components/ClassicHomeClient";

export default function ClassicHomePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[rgb(var(--bg))]" aria-hidden />}>
      <ClassicHomeClient />
    </Suspense>
  );
}
