"use client";

import { cn } from "@shared/components/ui/cn";

export function PromptTag({
  label,
  onClick
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full min-w-0 rounded-full border border-[#E8EAED] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#3C4858] shadow-sm transition",
        "hover:bg-slate-50 active:translate-y-[1px] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
      )}
    >
      <span className="block truncate">{label}</span>
    </button>
  );
}

