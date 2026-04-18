"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LaunchScreen } from "@shared/components/screens/LaunchScreen";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => {
      router.replace("/assistant/");
    }, 3000);
    const hardFallback = window.setTimeout(() => {
      if (window.location.pathname === "/") {
        window.location.replace("/assistant/");
      }
    }, 5200);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(hardFallback);
    };
  }, [router]);

  return <LaunchScreen />;
}
