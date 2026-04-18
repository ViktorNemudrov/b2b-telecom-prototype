"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { userProfile } from "@shared/lib/mockData";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";

const sphereSrc = "/mockups/%D0%A8%D0%B0%D1%80.png";

export function GlobalAppHeader({
  profileHref = "/settings",
  showSearch = true
}: {
  profileHref?: string;
  /** Показывать кнопку поиска (мок) */
  showSearch?: boolean;
}) {
  const profileCustom = useUiCustomization("classic.profile");
  const searchCustom = useUiCustomization("classic.search");
  const notificationsCustom = useUiCustomization("classic.notifications");

  return (
    <div className="sticky top-0 z-40 border-b border-slate-100 bg-[rgb(var(--bg))]/95 backdrop-blur dark:border-slate-800">
      <div className="safe-px flex items-center justify-between gap-2 py-2">
        <Link
          href={profileHref}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white transition",
            "active:translate-y-[1px] hover:bg-slate-50",
            "dark:border-slate-600 dark:bg-[rgb(var(--card))] dark:hover:bg-slate-800",
            getCustomizationButtonClasses(profileCustom.dimmedDisabled)
          )}
          aria-label="Профиль"
          onClick={(e) => {
            if (profileCustom.dimmedDisabled) {
              e.preventDefault();
              return;
            }
            if (profileCustom.useMock) {
              e.preventDefault();
              openDevelopmentStub("Профиль (мок из кастомизации).");
            }
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent-dark/5 dark:bg-white/10">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">ИП</span>
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col items-center px-1">
          <div className="flex items-center gap-2">
            <Image
              src={sphereSrc}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full object-cover shadow-softSm ring-1 ring-black/5 dark:ring-white/10"
            />
            <div className="min-w-0 text-center leading-tight">
              <div className="text-[12px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Билайн <span className="text-accent-yellow">One</span>
                <span className="font-medium text-slate-600 dark:text-slate-300"> · Ваш бизнес ассистент</span>
              </div>
              <div className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {userProfile.legalName}
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {showSearch ? (
            <button
              type="button"
              onClick={() => {
                if (searchCustom.useMock) {
                  openDevelopmentStub("Поиск (мок из кастомизации).");
                  return;
                }
                openDevelopmentStub("Поиск по сервисам.");
              }}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:translate-y-[1px] dark:border-slate-600 dark:bg-[rgb(var(--card))] dark:text-slate-200 dark:hover:bg-slate-800",
                getCustomizationButtonClasses(searchCustom.dimmedDisabled)
              )}
              aria-label="Поиск"
              disabled={searchCustom.dimmedDisabled}
            >
              <Search className="h-5 w-5" />
            </button>
          ) : null}
          <Link
            href="/notifications/"
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white transition hover:bg-slate-50 active:translate-y-[1px] dark:border-slate-600 dark:bg-[rgb(var(--card))] dark:hover:bg-slate-800",
              getCustomizationButtonClasses(notificationsCustom.dimmedDisabled)
            )}
            aria-label="Уведомления"
            onClick={(e) => {
              if (notificationsCustom.dimmedDisabled) {
                e.preventDefault();
                return;
              }
              if (notificationsCustom.useMock) {
                e.preventDefault();
                openDevelopmentStub("Уведомления (мок из кастомизации).");
              }
            }}
          >
            <Bell className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-yellow" />
          </Link>
        </div>
      </div>
    </div>
  );
}
