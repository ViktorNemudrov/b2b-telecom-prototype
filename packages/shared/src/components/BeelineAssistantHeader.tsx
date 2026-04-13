"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LayoutGrid, Search } from "lucide-react";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

const sphereSrc = "/mockups/%D0%A8%D0%B0%D1%80.png";

/**
 * Шапка основных экранов AI-ветки по макету 1722.png:
 * профиль БВ, центральный переключатель «поиск+шар» / сетка, колокольчик.
 */
export function BeelineAssistantHeader() {
  const pathname = usePathname() ?? "";
  const isEvents = pathname === "/events";
  const isAssistantTab = !isEvents;

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8EAED] bg-[#F7F8FA]/95 backdrop-blur dark:border-slate-800 dark:bg-[rgb(var(--bg))]/95">
      <div className="safe-px flex items-center justify-between gap-2 py-2.5">
        <Link href="/settings" className="relative shrink-0" aria-label="Профиль">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#007AFF] text-[13px] font-bold leading-none text-white shadow-sm dark:bg-blue-600">
            БВ
          </span>
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#F7F8FA] bg-[#FF3B30] dark:border-[rgb(var(--bg))]"
            aria-hidden
          />
        </Link>

        <div className="flex min-w-0 flex-1 justify-center px-1">
          <div className="inline-flex rounded-full bg-[#E8E8ED]/90 p-[3px] dark:bg-slate-700/80">
            <Link
              href="/assistant"
              className={cn(
                "relative flex h-9 min-w-[100px] items-center justify-center gap-1 rounded-full px-3 text-slate-600 transition dark:text-slate-300",
                isAssistantTab && "bg-white shadow-sm dark:bg-slate-800"
              )}
              aria-current={isAssistantTab ? "page" : undefined}
            >
              <Search className="h-[18px] w-[18px] shrink-0 opacity-80" strokeWidth={2.25} />
              <Image
                src={sphereSrc}
                alt=""
                width={22}
                height={22}
                className="h-[22px] w-[22px] shrink-0 rounded-full object-cover ring-1 ring-black/5"
              />
            </Link>
            <Link
              href="/events"
              className={cn(
                "relative flex h-9 min-w-[100px] items-center justify-center rounded-full px-3 text-slate-600 transition dark:text-slate-300",
                isEvents && "bg-white shadow-sm dark:bg-slate-800"
              )}
              aria-current={isEvents ? "page" : undefined}
            >
              <LayoutGrid className="h-[18px] w-[18px] opacity-80" strokeWidth={2.25} />
              <span
                className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-[#FF3B30]"
                aria-hidden
              />
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#E5E5EA] bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800"
          aria-label="Уведомления"
          onClick={() => openDevelopmentStub("Центр уведомлений (мок).")}
        >
          <Bell className="h-[22px] w-[22px] text-[#3C3C43] dark:text-slate-200" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF3B30]" aria-hidden />
        </button>
      </div>
    </header>
  );
}
