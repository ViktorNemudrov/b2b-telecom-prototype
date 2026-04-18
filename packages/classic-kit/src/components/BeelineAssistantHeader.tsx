"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";

const sphereSrc = "/mockups/%D0%A8%D0%B0%D1%80.png";

/**
 * Сетка 2×2 по Состояния_навбар.png: неактивно — только обводка; активно — заливка квадратов.
 */
function WidgetsNavIcon({ active, className }: { active: boolean; className?: string }) {
  const cells = [
    { x: 4, y: 4 },
    { x: 13, y: 4 },
    { x: 4, y: 13 },
    { x: 13, y: 13 }
  ];
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x}
          y={c.y}
          width={7}
          height={7}
          rx={1.5}
          fill={active ? "currentColor" : "none"}
          stroke={active ? "none" : "currentColor"}
          strokeWidth={active ? 0 : 1.35}
        />
      ))}
    </svg>
  );
}

/** Иконка фида из Состояния_навбар.png: четыре горизонтальные полосы. */
function FeedNavIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="5" width="16" height="4" rx="2" className="fill-current" />
      <rect x="4" y="11" width="16" height="2" rx="1" className="fill-current" />
      <rect x="4" y="15" width="16" height="2" rx="1" className="fill-current" />
      <rect x="4" y="19" width="16" height="2" rx="1" className="fill-current" />
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
          compact ? "left-[5px] top-[5px] h-[10px] w-[10px]" : "left-[7px] top-[7px] h-[14px] w-[14px]",
          !active && "opacity-45 grayscale"
        )}
      />
    </div>
  );
}

/**
 * Шапка Classic: [Профиль] — [Фид | Главный | Виджеты] — [Уведомления].
 * Активный раздел: белая пилюля + контрастная иконка (см. Состояния_навбар.png).
 */
export function BeelineAssistantHeader() {
  const pathname = usePathname() ?? "";
  const isFeed = pathname === "/events" || pathname.startsWith("/events/");
  const isMain =
    pathname === "/assistant" ||
    pathname === "/assistant/" ||
    pathname.startsWith("/assistant/");
  const isWidgets = pathname === "/widgets" || pathname.startsWith("/widgets/");

  const profileCustom = useUiCustomization("classic.profile");
  const feedSwitchCustom = useUiCustomization("classic.switch.events");
  const mainSwitchCustom = useUiCustomization("classic.switch.assistant");
  const widgetsSwitchCustom = useUiCustomization("classic.switch.widgets");
  const notificationsCustom = useUiCustomization("classic.notifications");

  const iconInactive = "text-slate-300 dark:text-slate-500";
  const iconActive = "text-slate-800 dark:text-slate-100";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100/90 bg-[rgb(var(--bg))]/95 backdrop-blur dark:border-slate-800 dark:bg-[rgb(var(--bg))]/95">
      <div className="safe-px flex h-11 items-center gap-2">
        <Link
          href="/settings/"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200/90 bg-[rgb(var(--card))] transition",
            "hover:bg-slate-50/80 active:translate-y-[1px] dark:border-slate-600 dark:bg-[rgb(var(--card))] dark:hover:bg-slate-800",
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

        <div className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-slate-200/40 p-1 dark:bg-slate-700/40">
          <Link
            href="/events/"
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center rounded-full transition-colors",
              getCustomizationButtonClasses(feedSwitchCustom.dimmedDisabled)
            )}
            aria-label="Фид"
            aria-current={isFeed ? "page" : undefined}
            onClick={(e) => {
              if (feedSwitchCustom.dimmedDisabled) {
                e.preventDefault();
                return;
              }
              if (feedSwitchCustom.useMock) {
                e.preventDefault();
                openDevelopmentStub("Фид (мок из кастомизации).");
              }
            }}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                isFeed &&
                  "bg-[rgb(var(--card))] shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-slate-800 dark:shadow-none"
              )}
            >
              <FeedNavIcon
                className={cn("h-[18px] w-[18px]", isFeed ? iconActive : iconInactive)}
              />
            </span>
          </Link>

          <Link
            href="/assistant/?reset=1"
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center rounded-full px-0.5 transition-colors",
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
            {isMain ? (
              <span className="flex items-center justify-center rounded-full border border-slate-200/90 bg-[rgb(var(--card))] px-3 py-1 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:border-slate-600 dark:bg-slate-800/90 dark:shadow-none">
                <SphereMagnifierMark compact active />
              </span>
            ) : (
              <span className="flex items-center justify-center px-1 py-0.5">
                <SphereMagnifierMark compact active={false} />
              </span>
            )}
          </Link>

          <Link
            href="/widgets/"
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center rounded-full transition-colors",
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
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                isWidgets &&
                  "bg-[rgb(var(--card))] shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-slate-800 dark:shadow-none"
              )}
            >
              <WidgetsNavIcon
                active={isWidgets}
                className={cn("h-[17px] w-[17px]", isWidgets ? iconActive : iconInactive)}
              />
            </span>
          </Link>
        </div>

        <Link
          href="/notifications/"
          className={cn(
            "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200/90 bg-[rgb(var(--card))] transition",
            "hover:bg-slate-50/80 active:translate-y-[1px] dark:border-slate-600 dark:bg-[rgb(var(--card))] dark:hover:bg-slate-800",
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
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-yellow"
            aria-hidden
          />
        </Link>
      </div>
    </header>
  );
}
