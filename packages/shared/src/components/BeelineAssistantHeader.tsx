"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LayoutGrid, Search } from "lucide-react";
import { cn } from "@shared/components/ui/cn";

const sphereSrc = "/mockups/%D0%A8%D0%B0%D1%80.png";

/**
 * Шапка основных экранов AI-ветки по макету 1722.png:
 * профиль БВ, центральный переключатель «поиск+шар» / сетка, колокольчик.
 */
export function BeelineAssistantHeader() {
  const pathname = usePathname() ?? "";
  const isEvents = pathname === "/events" || pathname === "/events/";
  const isAssistantTab = !isEvents;

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8EAED] bg-[#F7F8FA]/95 backdrop-blur dark:border-slate-800 dark:bg-[rgb(var(--bg))]/95">
      <div className="safe-px flex items-center justify-between gap-2 py-2.5">
        <Link href="/settings/" className="shrink-0" aria-label="Профиль">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#007AFF] text-[13px] font-bold leading-none text-white shadow-sm dark:bg-blue-600">
            БВ
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 justify-center px-1">
          <div className="inline-flex rounded-full bg-[#E8E8ED]/90 p-[3px] dark:bg-slate-700/80">
            <Link
              href="/assistant/?reset=1"
              className={cn(
                "relative flex h-9 min-w-[100px] items-center justify-center rounded-full px-3 text-slate-600 transition dark:text-slate-300",
                isAssistantTab && "bg-white shadow-sm dark:bg-slate-800"
              )}
              aria-current={isAssistantTab ? "page" : undefined}
            >
              <span className="relative inline-flex h-6 w-6 items-center justify-center">
                <Search className="h-[20px] w-[20px] opacity-85" strokeWidth={2.25} />
                <Image
                  src={sphereSrc}
                  alt=""
                  width={10}
                  height={10}
                  className="absolute top-[6px] h-[10px] w-[10px] rounded-full object-cover ring-1 ring-black/10"
                />
              </span>
            </Link>
            <Link
              href="/events/"
              className={cn(
                "relative flex h-9 min-w-[100px] items-center justify-center rounded-full px-3 text-slate-600 transition dark:text-slate-300",
                isEvents && "bg-white shadow-sm dark:bg-slate-800"
              )}
              aria-current={isEvents ? "page" : undefined}
            >
              <LayoutGrid className="h-[18px] w-[18px] opacity-80" strokeWidth={2.25} />
            </Link>
          </div>
        </div>

        <Link
          href="/notifications/"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#E5E5EA] bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800"
          aria-label="Уведомления"
        >
          <Bell className="h-[22px] w-[22px] text-[#3C3C43] dark:text-slate-200" />
        </Link>
      </div>
    </header>
  );
}
