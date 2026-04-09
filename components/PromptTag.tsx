"use client";

import { cn } from "@/components/ui/cn";

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
        "shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-softSm transition",
        "hover:bg-slate-50 active:translate-y-[1px]"
      )}
    >
      {label}
    </button>
  );
}

