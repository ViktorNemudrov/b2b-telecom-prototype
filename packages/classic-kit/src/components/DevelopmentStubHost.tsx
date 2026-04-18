"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@shared/components/ui/button";
import { SwipeSheet, SwipeSheetHandle } from "@shared/components/ui/SwipeSheet";

export function DevelopmentStubHost() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onStub = () => setOpen(true);
    window.addEventListener("development-stub", onStub as EventListener);
    return () => window.removeEventListener("development-stub", onStub as EventListener);
  }, []);

  return (
    <SwipeSheet open={open} onClose={close} innerClassName="border-slate-200">
      <SwipeSheetHandle />
      <div className="safe-px px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-2">
        <h2 className="text-lg font-bold text-slate-900">Раздел в разработке</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          В демо-версии этот сценарий пока не подключён. Доступны экраны с моковыми данными и навигация по прототипу.
        </p>
        <p className="mt-3 text-xs text-slate-500">Потяните вниз, чтобы закрыть.</p>
        <Button type="button" className="mt-5 w-full rounded-2xl py-6 text-base font-semibold" onClick={close}>
          Понятно
        </Button>
      </div>
    </SwipeSheet>
  );
}
