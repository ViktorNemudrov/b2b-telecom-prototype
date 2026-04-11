"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TargetMailingModal } from "@/components/TargetMailingModal";
import { openDevelopmentStub } from "@/lib/developmentStub";
import { AiAssistantScreen } from "@/components/screens/AiAssistantScreen";

export function AssistantClient() {
  const router = useRouter();
  const [promoOpen, setPromoOpen] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("promo") === "1") setPromoOpen(true);
  }, []);

  const closePromo = useCallback(() => {
    setPromoOpen(false);
    router.replace("/assistant");
  }, [router]);

  const onOrder = useCallback(() => {
    openDevelopmentStub("Оформление заявки на таргет-рассылку.");
    closePromo();
  }, [closePromo]);

  return (
    <>
      <div className="safe-px pt-2">
        <AiAssistantScreen />
      </div>
      <TargetMailingModal open={promoOpen} onClose={closePromo} onPrimaryAction={onOrder} />
    </>
  );
}
