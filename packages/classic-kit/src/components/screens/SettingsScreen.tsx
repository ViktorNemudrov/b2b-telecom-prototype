"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Headphones, Lock, Sliders, Sun } from "lucide-react";
import { useAppTheme } from "@shared/components/ThemeProvider";
import { PageBackLink } from "@shared/components/PageBackLink";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { cn } from "@shared/components/ui/cn";
import { userProfile } from "@shared/lib/mockData";

export function SettingsScreen({
  appealsHref = "/appeals/",
  backHref = "/assistant/",
  faqHref = "/settings/faq/",
  qaHref = "/qa/",
  onboardingHref = "/onboarding/?from=settings",
  subscriptionHref = "/settings/subscription/",
  customizationHref = "/settings/customization/"
}: {
  appealsHref?: string;
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
    window.location.href = "/";
  };

  return (
    <div className="safe-px mx-auto max-w-[430px] pb-10 pt-0">
      <div className="space-y-0.5">
        <div className="relative flex min-h-8 items-center justify-center">
          <PageBackLink href={backHref} className="absolute left-0 mb-0 h-8 w-8 p-0 leading-none" />
          <div className="text-center text-lg font-bold text-slate-900 dark:text-slate-100">
            Билайн <span className="text-accent-yellow">One</span>
          </div>
        </div>
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">{userProfile.legalName}</div>
      </div>

      <div className="mt-4 space-y-4">
      <Card className="border-violet-200/50 bg-gradient-to-br from-violet-50 to-white dark:border-violet-800/50 dark:from-violet-950/40 dark:to-slate-900">
        <CardContent className="space-y-3 pb-5 pt-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-200 dark:text-slate-900">
            <span className="text-accent-yellow">✓</span> Подписка
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">Связь для бизнеса</div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">1 999 ₽</span>
            <span className="text-right text-xs text-slate-500 dark:text-slate-400">
              списание
              <br />
              25.04
            </span>
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
          <Link href={appealsHref} className="flex items-center gap-3 px-4 py-3">
            <Headphones className="h-5 w-5 text-slate-500" />
            <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">Поддержка</span>
            <ChevronLeft className="h-4 w-4 rotate-180 text-slate-400" />
          </Link>
          <div className="flex items-center gap-3 px-4 py-3">
            <Sun className="h-5 w-5 text-slate-500" />
            <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">Тема приложения</span>
            <select
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              value={mode}
              onChange={(e) => setMode(e.target.value as "light" | "dark" | "system")}
            >
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
              <option value="system">Системная</option>
            </select>
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
        <p>Версия продукта: v.0.2.14</p>
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
