"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { TargetMailingModal } from "@shared/components/TargetMailingModal";
import { HomeDashboardScreen } from "@shared/components/screens/HomeDashboardScreen";
import { LaunchScreen } from "@shared/components/screens/LaunchScreen";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

export function ClassicHomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<"launch" | "home">("launch");
  const [promoOpen, setPromoOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("promo") === "1") setPromoOpen(true);
  }, [searchParams]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setPhase("home");
      setPromoOpen(true);
      router.replace("/?promo=1", { scroll: false });
    }, 2000);
    return () => window.clearTimeout(t);
  }, [router]);

  if (phase === "launch") {
    return <LaunchScreen />;
  }

  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-2">
          <HomeDashboardScreen />
        </div>
      </AppShell>
      <TargetMailingModal
        open={promoOpen}
        onClose={() => {
          setPromoOpen(false);
          router.replace("/", { scroll: false });
        }}
        onPrimaryAction={() => {
          openDevelopmentStub("Оформление заявки на таргет-рассылку.");
          setPromoOpen(false);
          router.replace("/", { scroll: false });
        }}
      />
    </>
  );
}
