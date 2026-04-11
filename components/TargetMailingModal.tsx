"use client";

import { X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function TargetMailingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative -mt-2">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-softSm backdrop-blur transition hover:bg-white"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-[#EDE8FF] to-[#F5F3FF] px-4 pb-4 pt-10">
          <div className="mx-auto mb-4 flex h-24 w-40 items-center justify-center rounded-2xl bg-white/60 text-4xl shadow-softSm">
            📣
          </div>
        </div>

        <div className="px-1 pt-4">
          <h2 className="text-xl font-bold text-slate-900">Таргет рассылка</h2>
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
          <Button className="mt-6 w-full rounded-2xl py-6 text-base font-bold" onClick={onClose}>
            Заказать рассылку
          </Button>
        </div>
      </div>
    </Modal>
  );
}
