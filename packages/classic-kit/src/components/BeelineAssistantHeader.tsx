"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";

const sphereSrc = "/mockups/%D0%A8%D0%B0%D1%80.png";

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

function WidgetsNavIcon({ active, className }: { active: boolean; className?: string }) {
  const activeStroke = "#2F3141";
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="4"
        y="4"
        width="9"
        height="9"
        rx="2.25"
        fill={active ? "currentColor" : "none"}
        stroke={active ? activeStroke : "currentColor"}
        strokeWidth={1.35}
      />
      <rect
        x="15"
        y="4"
        width="5"
        height="5"
        rx="1.25"
        fill={active ? "currentColor" : "none"}
        stroke={active ? activeStroke : "currentColor"}
        strokeWidth={1.35}
      />
      <rect
        x="4"
        y="15"
        width="5"
        height="5"
        rx="1.25"
        fill={active ? "currentColor" : "none"}
        stroke={active ? activeStroke : "currentColor"}
        strokeWidth={1.35}
      />
      <rect
        x="11"
        y="11"
        width="9"
        height="9"
        rx="2.25"
        fill={active ? "currentColor" : "none"}
        stroke={active ? activeStroke : "currentColor"}
        strokeWidth={1.35}
      />
    </svg>
  );
}

/** Шар в лупе — главный экран; `active` — полноцветная линза, иначе приглушённая. */
function SphereMagnifierMark({
  className,
  compact,
  active
}: {
  className?: string;
  compact?: boolean;
  active?: boolean;
}) {
  const box = compact ? "h-7 w-7" : "h-9 w-9";
  const imgSize = compact ? 10 : 14;
  return (
    <div className={cn("relative shrink-0", box, className)}>
      <svg
        className={cn(
          "pointer-events-none absolute inset-0",
          box,
          active ? "text-[#3C3C43] dark:text-slate-200" : "text-slate-300 dark:text-slate-500"
        )}
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden
      >
        <circle cx="14.5" cy="14.5" r="9" stroke="currentColor" strokeWidth="1.6" />
        <line
          x1="21.5"
          y1="21.5"
          x2="30"
          y2="30"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <Image
        src={sphereSrc}
        alt=""
        width={imgSize}
        height={imgSize}
        className={cn(
          "absolute rounded-full object-cover ring-1 ring-black/10",
          compact ? "left-[6px] top-[6px] h-[10px] w-[10px]" : "left-[7px] top-[7px] h-[14px] w-[14px]",
          !active && "opacity-45 grayscale"
        )}
      />
    </div>
  );
}

/**
 * Шапка Classic: [Профиль] — [Главный | Виджеты] — [Уведомления].
 * Активный раздел: белая пилюля + контрастная иконка (см. Состояния_навбар.png).
 */
export function BeelineAssistantHeader() {
  const pathname = usePathname() ?? "";
  if (shouldHideClassicTopNav(pathname)) return null;

  const isMain =
    pathname === "/assistant" ||
    pathname === "/assistant/" ||
    pathname.startsWith("/assistant/");
  const isWidgets = pathname === "/widgets" || pathname.startsWith("/widgets/");

  const profileCustom = useUiCustomization("classic.profile");
  const mainSwitchCustom = useUiCustomization("classic.switch.assistant");
  const widgetsSwitchCustom = useUiCustomization("classic.switch.widgets");

  const iconInactive = "text-slate-300 dark:text-slate-500";
  const iconActive = "text-slate-800 dark:text-slate-100";

  return (
    <header className="sticky top-0 z-40 bg-white pt-1 dark:bg-slate-950">
      <div className="safe-px flex h-10 items-center gap-2">
        <Link
          href="/settings/"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent-yellow/70 bg-accent-yellow text-slate-900 transition",
            "hover:brightness-95 active:translate-y-[1px]",
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
          <span className="inline-flex items-center justify-center text-[9px] font-bold leading-none translate-y-[1.25px]">ИП</span>
        </Link>

        <div className="flex h-10 min-w-0 flex-1 items-center rounded-full border border-slate-200/80 bg-white p-1 dark:border-white/15 dark:bg-[rgb(var(--bg))]">
          <Link
            href="/assistant/?reset=1"
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center rounded-full border border-transparent px-0.5 transition-colors",
              isMain
                ? "border-slate-200/80 bg-slate-100/80 text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-slate-100"
                : "text-slate-400 dark:text-slate-500",
              getCustomizationButtonClasses(mainSwitchCustom.dimmedDisabled)
            )}
            aria-label="Главный экран"
            aria-current={isMain ? "page" : undefined}
            onClick={(e) => {
              if (mainSwitchCustom.dimmedDisabled) {
                e.preventDefault();
                return;
              }
              if (mainSwitchCustom.useMock) {
                e.preventDefault();
                openDevelopmentStub("Главный экран (мок из кастомизации).");
              }
            }}
          >
            <span className="flex items-center justify-center px-1 py-0.5">
              <SphereMagnifierMark compact active={isMain} />
            </span>
          </Link>
          <Link
            href="/widgets/"
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center rounded-full border border-transparent transition-colors",
              isWidgets
                ? "border-slate-200/80 bg-slate-100/80 text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-slate-100"
                : "text-slate-400 dark:text-slate-500",
              getCustomizationButtonClasses(widgetsSwitchCustom.dimmedDisabled)
            )}
            aria-label="Виджеты"
            aria-current={isWidgets ? "page" : undefined}
            onClick={(e) => {
              if (widgetsSwitchCustom.dimmedDisabled) {
                e.preventDefault();
                return;
              }
              if (widgetsSwitchCustom.useMock) {
                e.preventDefault();
                openDevelopmentStub("Виджеты (мок из кастомизации).");
              }
            }}
          >
            <span className="flex items-center justify-center px-1 py-0.5">
              <span className="flex h-7 w-7 items-center justify-center">
                <WidgetsNavIcon
                  active={isWidgets}
                  className={cn("h-[17px] w-[17px]", isWidgets ? "text-accent-yellow" : iconInactive)}
                />
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
