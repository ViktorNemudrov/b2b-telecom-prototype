"use client";

import { Bell, Search, User2 } from "lucide-react";
import { cn } from "@/components/ui/cn";

export function AppHeader() {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-100 bg-[rgb(var(--bg))]/95 backdrop-blur">
      <div className="safe-px flex items-center justify-between gap-2 py-2">
        <button
          type="button"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white transition",
            "active:translate-y-[1px] hover:bg-slate-50"
          )}
          aria-label="Профиль"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent-dark/5">
            <User2 className="h-5 w-5 text-slate-700" />
          </div>
        </button>

        <div className="flex min-w-0 flex-1 flex-col items-center px-1">
          <div className="flex items-center gap-2">
            <span
              className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-accent-yellow to-neutral-800 shadow-softSm"
              aria-hidden
            />
            <div className="min-w-0 text-center leading-tight">
              <div className="text-[13px] font-bold tracking-tight text-slate-900">
                Билайн <span className="text-accent-yellow">One</span>
              </div>
              <div className="truncate text-[10px] font-medium text-slate-500">ИП Балашов Владислав</div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:translate-y-[1px]"
            aria-label="Поиск"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white transition hover:bg-slate-50 active:translate-y-[1px]"
            aria-label="Уведомления"
          >
            <Bell className="h-5 w-5 text-slate-700" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-yellow" />
          </button>
        </div>
      </div>
    </div>
  );
}
