"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@shared/components/ui/cn";
import { goSmartBack } from "@shared/lib/smartBack";

type Props = {
  /** Куда перейти, если в истории нет предыдущего шага (прямой заход на страницу). */
  href?: string;
  label?: string;
  className?: string;
};

/**
 * Кнопка «Назад»: сначала router.back (согласовано с аппаратной кнопкой «Назад» при цепочке переходов),
 * иначе — переход на href (по умолчанию ассистент).
 */
export function PageBackLink({ href = "/assistant/", label = "Назад", className }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={cn(
        "mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#3C4858] transition hover:text-[#212529] dark:text-slate-200 dark:hover:text-white",
        className
      )}
      onClick={() => goSmartBack(router, href)}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-slate-700">
        <ChevronLeft className="h-4 w-4" />
      </span>
      {label}
    </button>
  );
}
