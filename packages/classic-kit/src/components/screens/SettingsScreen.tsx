"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, Lock, Sliders, Sun } from "lucide-react";
import { CenteredPageTitleBar } from "@shared/components/CenteredPageTitleBar";
import { useAppTheme } from "@shared/components/ThemeProvider";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { clearAssistantChatSession } from "@shared/lib/assistantChatSession";
import { CLASSIC_PRODUCT_VERSION } from "@shared/lib/productVersion";
import { cn } from "@shared/components/ui/cn";
import { userProfile } from "@shared/lib/mockData";

const THEME_OPTIONS: { value: "light" | "dark" | "system"; label: string }[] = [
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
  { value: "system", label: "Системная" }
];

function AppThemeSelect({
  mode,
  setMode
}: {
  mode: "light" | "dark" | "system";
  setMode: (next: "light" | "dark" | "system") => void;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const currentLabel = THEME_OPTIONS.find((o) => o.value === mode)?.label ?? mode;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Тема приложения"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-w-[7.5rem] items-center justify-between gap-1 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 shadow-softSm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
        <span>{currentLabel}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform dark:text-slate-400", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Тема приложения"
          className="absolute right-0 top-[calc(100%+6px)] z-[80] min-w-[10.5rem] overflow-hidden rounded-3xl border border-slate-200 bg-white p-1.5 shadow-soft dark:border-slate-600 dark:bg-slate-900"
        >
          {THEME_OPTIONS.map((opt) => {
            const selected = opt.value === mode;
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "flex w-full items-center rounded-2xl px-3 py-2 text-left text-xs font-medium transition",
                    selected
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
                      : "text-slate-900 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                  )}
                  onClick={() => {
                    setMode(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function SettingsScreen({
  backHref = "/assistant/",
  faqHref = "/settings/faq/",
  qaHref = "/qa/",
  onboardingHref = "/onboarding/?from=settings",
  subscriptionHref = "/settings/subscription/",
  customizationHref = "/settings/customization/"
}: {
  backHref?: string;
  faqHref?: string;
  qaHref?: string;
  onboardingHref?: string;
  subscriptionHref?: string;
  customizationHref?: string;
}) {
  const { mode, setMode } = useAppTheme();
  const [notificationsOn, setNotificationsOn] = React.useState(true);

  const onExit = () => {
    clearAssistantChatSession();
    window.location.href = "/";
  };

  return (
    <div className="safe-px mx-auto max-w-[430px] pb-10 pt-4">
      <CenteredPageTitleBar
        backHref={backHref}
        title={
          <>
            Билайн <span className="text-accent-yellow">One</span>
          </>
        }
        subtitle={userProfile.legalName}
        titleClassName="font-bold"
        subtitleClassName="text-sm text-slate-600 dark:text-slate-400"
      />

      <div className="mt-4 space-y-4">
      <Card className="border-violet-200/50 bg-gradient-to-br from-violet-50 to-white dark:border-violet-800/50 dark:from-violet-950/40 dark:to-slate-900">
        <CardContent className="space-y-3 pb-5 pt-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-200 dark:text-slate-900">
            <span className="text-accent-yellow">✓</span> Подписка
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">Связь для бизнеса</div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">1 999 ₽</span>
            <span className="whitespace-nowrap text-right text-xs text-slate-500 dark:text-slate-400">{"списание\u00A025.04"}</span>
          </div>
          <Link href={subscriptionHref}>
            <Button variant="secondary" className="w-full rounded-2xl">
              Управление подпиской
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800/90">
        <CardContent className="divide-y divide-slate-100 p-0 dark:divide-slate-600">
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
            onClick={() => openDevelopmentStub("Управление профилем (мок).")}
          >
            <Sliders className="h-5 w-5 text-slate-500" />
            <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">Управление профилем</span>
            <ChevronLeft className="h-4 w-4 rotate-180 text-slate-400" />
          </button>
          <div className="relative z-10 flex items-center gap-3 px-4 py-3">
            <Sun className="h-5 w-5 text-slate-500" />
            <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">Тема приложения</span>
            <AppThemeSelect mode={mode} setMode={setMode} />
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3"
            onClick={() => openDevelopmentStub("Безопасность (мок).")}
          >
            <Lock className="h-5 w-5 text-slate-500" />
            <span className="flex-1 text-left text-sm font-medium text-slate-900 dark:text-slate-100">Безопасность</span>
            <ChevronLeft className="h-4 w-4 rotate-180 text-slate-400" />
          </button>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Уведомления</span>
            <button
              type="button"
              role="switch"
              aria-checked={notificationsOn}
              className={cn(
                "relative h-7 w-12 rounded-full transition",
                notificationsOn ? "bg-accent-yellow" : "bg-slate-300 dark:bg-slate-600"
              )}
              aria-label="Уведомления"
              onClick={() => setNotificationsOn((v) => !v)}
            >
              <span
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
                  notificationsOn ? "right-1" : "left-1"
                )}
              />
            </button>
          </div>
          <Link href={faqHref} className="flex items-center gap-3 px-4 py-3 opacity-80">
            <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">FAQ и история версий</span>
            <ChevronLeft className="h-4 w-4 rotate-180 text-slate-400" />
          </Link>
          <Link href={qaHref} className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">Проверка устройства (QA)</span>
            <ChevronLeft className="h-4 w-4 rotate-180 text-slate-400" />
          </Link>
          <Link href={onboardingHref} className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">Онбординг</span>
            <ChevronLeft className="h-4 w-4 rotate-180 text-slate-400" />
          </Link>
          <Link href={customizationHref} className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">Кастомизация приложения</span>
            <ChevronLeft className="h-4 w-4 rotate-180 text-slate-400" />
          </Link>
        </CardContent>
      </Card>

      <div className="space-y-1 px-1 text-[11px] text-slate-500 dark:text-slate-400">
        <p>Версия продукта: {CLASSIC_PRODUCT_VERSION}</p>
        <p>Дизайнер: Балашов Влад</p>
        <p>Создатель: Немудров Виктор</p>
        <p>Владелец продукта: Пальчиков Леонид</p>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-rose-600 dark:text-rose-400"
        onClick={onExit}
      >
        Выход
      </button>
      </div>
    </div>
  );
}
