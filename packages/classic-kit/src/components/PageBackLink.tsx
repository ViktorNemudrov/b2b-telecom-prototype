"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@shared/components/ui/cn";
import { goSmartBack } from "@shared/lib/smartBack";

type Props = {
  /** Куда перейти, если в истории нет предыдущего шага (прямой заход на страницу). */
  href?: string;
  /** Текст рядом с иконкой (по умолчанию только стрелка, подпись для скринридеров — «Назад»). */
  label?: string;
  className?: string;
};

/**
 * Кнопка «Назад»: через goSmartBack — тот же стек, что и у системной кнопки (см. smartBack.ts).
 */
export function PageBackLink({ href = "/assistant/", label, className }: Props) {
  const router = useRouter();
  const showText = Boolean(label?.trim());

  return (
    <button
      type="button"
      aria-label={showText ? undefined : "Назад"}
      className={cn(
        "mb-3 inline-flex items-center text-sm font-semibold text-[#3C4858] transition hover:text-[#212529] dark:text-slate-200 dark:hover:text-white",
        showText ? "gap-2" : "",
        className
      )}
      onClick={() => goSmartBack(router, href)}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-slate-700">
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </span>
      {showText ? label : null}
    </button>
  );
}
