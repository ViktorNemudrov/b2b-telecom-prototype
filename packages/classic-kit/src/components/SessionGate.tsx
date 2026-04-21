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
  const normalizePath = (value: string) => {
    if (!value) return "";
    if (value === "/") return "/";
    return value.replace(/\/+$/, "");
  };
  const normalizedPathname = normalizePath(pathname);
  const publicSet = useMemo(() => new Set(publicPaths.map(normalizePath)), [publicPaths]);
  const isPublic = normalizedPathname ? publicSet.has(normalizedPathname) : true;
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    if (!pathname) {
      // Во время гидрации pathname может быть пустым: не блокируем UI.
      setAllowed(true);
      return;
    }
    if (publicSet.has(normalizedPathname)) {
      setAllowed(true);
      return;
    }
    if (!authenticated) {
      router.replace(unauthenticatedRedirect);
      return;
    }
    setAllowed(true);
  }, [pathname, normalizedPathname, router, authenticated, publicSet, unauthenticatedRedirect]);

  if (!allowed) {
    return <div className="min-h-dvh bg-[rgb(var(--bg))]" aria-busy="true" />;
  }

  return <>{children}</>;
}
