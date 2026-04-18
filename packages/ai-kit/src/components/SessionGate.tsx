"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDemoSession } from "@shared/components/DemoSessionProvider";

export function SessionGate({
  children,
  publicPaths,
  unauthenticatedRedirect
}: {
  children: React.ReactNode;
  /** Маршруты без входа (приветствие, логин и т.п.) */
  publicPaths: readonly string[];
  /** Куда перенаправить с защищённого маршрута, если сессии нет */
  unauthenticatedRedirect: string;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { authenticated } = useDemoSession();
  const publicSet = useMemo(() => new Set(publicPaths), [publicPaths]);
  const isPublic = publicSet.has(pathname);
  const [allowed, setAllowed] = useState(isPublic);

  useEffect(() => {
    if (publicSet.has(pathname)) {
      setAllowed(true);
      return;
    }
    if (!authenticated) {
      router.replace(unauthenticatedRedirect);
      return;
    }
    setAllowed(true);
  }, [pathname, router, authenticated, publicSet, unauthenticatedRedirect]);

  if (!allowed) {
    return <div className="min-h-dvh bg-[rgb(var(--bg))]" aria-busy="true" />;
  }

  return <>{children}</>;
}
