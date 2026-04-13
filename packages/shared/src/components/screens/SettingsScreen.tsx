"use client";

import Link from "next/link";
import { ChevronLeft, Headphones, Lock, Sliders, Sun } from "lucide-react";
import { useAppTheme } from "@shared/components/ThemeProvider";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { userProfile } from "@shared/lib/mockData";

export function SettingsScreen({
  appealsHref = "/appeals",
  backHref = "/assistant"
}: {
  appealsHref?: string;
  backHref?: string;
}) {
  const { mode, setMode, resolved } = useAppTheme();

  return (
    <div className="safe-px mx-auto max-w-[430px] space-y-4 pb-10 pt-2">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
          <ChevronLeft className="h-4 w-4" />
        </span>
        Назад
      </Link>

      <div className="flex flex-col items-center gap-1 text-center">
        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Билайн <span className="text-accent-yellow">One</span>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">{userProfile.legalName}</div>
      </div>

      <Card className="border-violet-200/50 bg-gradient-to-br from-violet-50 to-white dark:border-violet-900/40 dark:from-violet-950/30 dark:to-slate-900">
        <CardContent className="space-y-3 pb-5 pt-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
            <span className="text-accent-yellow">✓</span> Подписка
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">Связь для бизнеса</div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-bold">1 999 ₽</span>
            <span className="text-right text-xs text-slate-500">
              списание
              <br />
              25.04
            </span>
          </div>
          <Button
            variant="secondary"
            className="w-full rounded-2xl"
            onClick={() => openDevelopmentStub("Управление подпиской (мок).")}
          >
            Управление подпиской
          </Button>
        </CardContent>
      </Card>

      <Card className="dark:border-slate-700">
        <CardContent className="divide-y divide-slate-100 p-0 dark:divide-slate-700">
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
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
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
              className={`
                relative h-7 w-12 rounded-full transition
                ${resolved === "dark" ? "bg-accent-yellow" : "bg-slate-300"}
              `}
              aria-label="Уведомления"
              onClick={() => openDevelopmentStub("Настройки уведомлений.")}
            >
              <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition" />
            </button>
          </div>
        </CardContent>
      </Card>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-rose-600"
        onClick={() => {
          openDevelopmentStub("Подождите, вы ещё не всё посмотрели в нашей демо-версии продукта.");
        }}
      >
        Выход
      </button>
    </div>
  );
}
