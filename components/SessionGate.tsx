"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasDemoSession } from "@/lib/demoSession";

const PUBLIC = new Set(["/", "/auth"]);

export function SessionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const isPublic = PUBLIC.has(pathname);
  const [allowed, setAllowed] = useState(isPublic);

  useEffect(() => {
    if (PUBLIC.has(pathname)) {
      setAllowed(true);
      return;
    }
    if (!hasDemoSession()) {
      router.replace("/");
      return;
    }
    setAllowed(true);
  }, [pathname, router]);

  if (!allowed) {
    return <div className="min-h-dvh bg-[rgb(var(--bg))]" aria-busy="true" />;
  }

  return <>{children}</>;
}
