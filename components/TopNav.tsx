"use client";

import { Bell, User2 } from "lucide-react";
import { SegmentedControl } from "@/components/SegmentedControl";
import { cn } from "@/components/ui/cn";

export function TopNav<T extends string>({
  tabs,
  value,
  onChange
}: {
  tabs: { key: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-100 bg-[rgb(var(--bg))]/80 backdrop-blur">
      <div className="safe-px flex h-16 items-center gap-3">
        <button
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-softSm transition",
            "active:translate-y-[1px] hover:bg-slate-50"
          )}
          aria-label="Профиль"
          onClick={() => {
            // prototype: no-op
          }}
        >
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-accent-violet/15 to-accent-teal/15">
            <User2 className="h-5 w-5 text-slate-700" />
          </div>
        </button>

        <div className="flex-1">
          <SegmentedControl value={value} options={tabs} onChange={onChange} />
        </div>

        <button
          className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-softSm transition",
            "active:translate-y-[1px] hover:bg-slate-50"
          )}
          aria-label="Уведомления"
          onClick={() => {
            // prototype: no-op
          }}
        >
          <Bell className="h-5 w-5 text-slate-700" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-violet" />
        </button>
      </div>
    </div>
  );
}

