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
    <div className="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/97 backdrop-blur-md dark:border-[rgb(var(--border))]">
      <div className="safe-px flex items-center justify-between gap-2 py-2.5">
        {/* Аватар профиля */}
        <Link
          href={profileHref}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
            "bg-[rgb(var(--card))] border border-[rgb(var(--border))]",
            "transition active:scale-95",
            "dark:bg-[rgb(var(--surface-2))]",
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
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent-orange/20 to-accent-amber/20 dark:from-accent-orange/30 dark:to-accent-amber/30">
            <span className="text-[11px] font-bold text-accent-orange">ИП</span>
          </div>
        </Link>

        {/* Центр: логотип + название */}
        <div className="flex min-w-0 flex-1 flex-col items-center px-1">
          <div className="flex items-center gap-2">
            <Image
              src={sphereSrc}
              alt=""
              width={26}
              height={26}
              className="h-[26px] w-[26px] shrink-0 rounded-full object-cover shadow-softSm ring-1 ring-black/10 dark:ring-white/10"
            />
            <div className="min-w-0 text-center leading-tight">
              <div className="text-[12px] font-bold tracking-tight text-[rgb(var(--text))]">
                Билайн <span className="text-accent-yellow">One</span>
                <span className="font-medium text-[rgb(var(--muted))]"> · Ваш бизнес ассистент</span>
              </div>
              <div className="truncate text-[10px] font-medium text-[rgb(var(--muted))]">
                {userProfile.legalName}
              </div>
            </div>
          </div>
        </div>

        {/* Правый блок: поиск + уведомления */}
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
                "flex h-10 w-10 items-center justify-center rounded-2xl",
                "border border-[rgb(var(--border))] bg-[rgb(var(--card))]",
                "text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))] active:scale-95",
                "dark:bg-[rgb(var(--surface-2))]",
                getCustomizationButtonClasses(searchCustom.dimmedDisabled)
              )}
              aria-label="Поиск"
              disabled={searchCustom.dimmedDisabled}
            >
              <Search className="h-4.5 w-4.5" />
            </button>
          ) : null}
          <Link
            href="/notifications/"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-2xl",
              "border border-[rgb(var(--border))] bg-[rgb(var(--card))]",
              "text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))] active:scale-95",
              "dark:bg-[rgb(var(--surface-2))]",
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
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-orange ring-2 ring-[rgb(var(--card))]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
