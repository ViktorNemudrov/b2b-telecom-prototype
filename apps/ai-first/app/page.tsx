"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LaunchScreen } from "@shared/components/screens/LaunchScreen";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => {
      router.replace("/assistant/");
    }, 2000);
    return () => window.clearTimeout(t);
  }, [router]);

  return <LaunchScreen />;
}
