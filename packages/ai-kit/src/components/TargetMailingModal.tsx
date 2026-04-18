"use client";

import { Button } from "@shared/components/ui/button";
import { SwipeSheet, SwipeSheetHandle } from "@shared/components/ui/SwipeSheet";

export function TargetMailingModal({
  open,
  onClose,
  onPrimaryAction
}: {
  open: boolean;
  onClose: () => void;
  onPrimaryAction?: () => void;
}) {
  const onCta = () => {
    if (onPrimaryAction) onPrimaryAction();
    else onClose();
  };

  return (
    <SwipeSheet
      open={open}
      onClose={onClose}
      innerClassName="border-0 bg-white shadow-2xl"
      backdropClassName="bg-slate-900/35"
      backdropDismiss={false}
      closeOnEscape={false}
    >
      <SwipeSheetHandle />

      <div className="overflow-hidden bg-gradient-to-b from-[#EDE8FF] via-[#F4F0FF] to-white px-4 pb-6 pt-2">
        <div className="relative mx-auto flex h-32 max-w-[240px] items-end justify-center gap-2">
          <div className="absolute inset-x-4 top-2 h-20 rounded-[40%] bg-gradient-to-br from-white/80 to-white/20 blur-sm" />
          <div className="relative z-[1] flex h-24 w-14 rotate-[-14deg] items-center justify-center rounded-2xl border border-white/70 bg-white/90 shadow-lg">
            <span className="text-2xl" aria-hidden>
              📱
            </span>
          </div>
          <div className="relative z-[2] flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-400 to-orange-200 shadow-lg">
            <span className="text-2xl" aria-hidden>
              📣
            </span>
          </div>
          <div className="relative z-[1] flex h-12 w-12 translate-y-1 rotate-[8deg] items-center justify-center rounded-xl border border-amber-100 bg-[#FFD429] shadow-md">
            <span className="text-lg font-bold text-slate-900">%</span>
          </div>
        </div>
      </div>

      <div className="safe-px px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
        <p className="text-xs text-slate-500">Закройте, потянув шторку вниз.</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Таргет рассылка</h2>
        <ol className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700">
          <li>
            <span className="font-bold text-slate-900">1. Расскажем всем о вашем бизнесе</span>
            <p className="mt-1 text-slate-600">Доставим ваше предложение вашей аудитории.</p>
          </li>
          <li>
            <span className="font-bold text-slate-900">2. Точный таргетинг</span>
            <p className="mt-1 text-slate-600">Настройка по интересам, географии и возрасту.</p>
          </li>
          <li>
            <span className="font-bold text-slate-900">3. Рост продаж и клиентов</span>
            <p className="mt-1 text-slate-600">Привлекайте покупателей напрямую.</p>
          </li>
        </ol>
        <Button
          className="mt-6 w-full rounded-2xl bg-[#FFD429] py-6 text-base font-bold text-slate-900 shadow-md hover:brightness-95"
          onClick={onCta}
        >
          Заказать рассылку
        </Button>
      </div>
    </SwipeSheet>
  );
}
