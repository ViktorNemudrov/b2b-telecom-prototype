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
        "w-full min-w-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-softSm transition",
        "hover:bg-slate-50 active:translate-y-[1px]"
      )}
    >
      <span className="block truncate">{label}</span>
    </button>
  );
}

