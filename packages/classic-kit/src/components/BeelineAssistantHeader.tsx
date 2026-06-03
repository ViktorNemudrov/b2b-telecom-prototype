"use client";

import Link from "next/link";
import { Bell, ChevronDown, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { userProfile } from "@shared/lib/mockData";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";

function shouldHideClassicTopNav(pathname: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";

  if (path === "/settings" || path.startsWith("/settings/")) return true;
  if (path === "/communication" || path.startsWith("/communication/")) return true;
  if (path === "/documents/finance" || path.startsWith("/documents/finance/")) return true;
  if (path === "/support" || path.startsWith("/support/")) return true;
  if (/^\/call\/[^/]+(?:\/.*)?$/.test(path)) return true;
  if (/^\/invoices\/[^/]+(?:\/.*)?$/.test(path)) return true;

  return false;
}

/**
 * Шапка Classic: [Аватар → /settings] — [Название ИП ↓ → /settings] — [Колокол → /notifications].
 * Тёмная тема основная (Figma zero-state header).
 */
export function BeelineAssistantHeader() {
  const pathname = usePathname() ?? "";
  if (shouldHideClassicTopNav(pathname)) return null;

  const profileCustom = useUiCustomization("classic.profile");
  const notificationsCustom = useUiCustomization("classic.notifications");

  return (
    <header className="sticky top-0 z-40 bg-[rgb(var(--bg))] pt-1">
      <div className="safe-px flex h-11 items-center gap-2">
        <Link
          href="/settings/"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] transition hover:brightness-110 active:translate-y-[1px]",
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
          <User className="h-4 w-4 text-[rgb(var(--muted))]" />
        </Link>

        <Link
          href="/settings/"
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))]/60 px-3 py-1.5 transition hover:brightness-110 active:translate-y-[1px]",
            getCustomizationButtonClasses(profileCustom.dimmedDisabled)
          )}
          aria-label="Профиль компании"
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
          <span className="text-[13px] font-medium text-[rgb(var(--text))]">{userProfile.legalName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-[rgb(var(--muted))]" />
        </Link>

        <Link
          href="/notifications/"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] transition hover:brightness-110 active:translate-y-[1px]",
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
          <Bell className="h-4 w-4 text-[rgb(var(--text))]" />
        </Link>
      </div>
    </header>
  );
}
