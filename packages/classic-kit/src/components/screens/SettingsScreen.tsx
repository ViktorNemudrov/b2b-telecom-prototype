"use client";

import * as React from "react";
import Link from "next/link";
import { Bot, ChevronLeft, CircleCheck, CircleX, Headphones, Loader2, Lock, Sliders, Sun } from "lucide-react";
import { CenteredPageTitleBar } from "@shared/components/CenteredPageTitleBar";
import { useAppTheme } from "@shared/components/ThemeProvider";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { CLASSIC_PRODUCT_VERSION } from "@shared/lib/productVersion";
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
  const [llmProbeLoading, setLlmProbeLoading] = React.useState(false);
  const [llmProbeError, setLlmProbeError] = React.useState<string | null>(null);
  const [llmProbeResults, setLlmProbeResults] = React.useState<
    Array<{
      provider: "gemini" | "together" | "openrouter" | "grok" | "groq";
      enabled: boolean;
      model: string;
      ok: boolean;
      httpStatus?: number;
      message: string;
    }>
  >([]);

  const runLlmDiagnostics = React.useCallback(async () => {
    setLlmProbeLoading(true);
    setLlmProbeError(null);
    try {
      const res = await fetch("/api/llm/diagnostics", { method: "GET", cache: "no-store" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}${text ? `: ${text.slice(0, 120)}` : ""}`);
      }
      const payload = (await res.json()) as {
        results?: Array<{
          provider: "gemini" | "together" | "openrouter" | "grok" | "groq";
          enabled: boolean;
          model: string;
          ok: boolean;
          httpStatus?: number;
          message: string;
        }>;
      };
      setLlmProbeResults(Array.isArray(payload.results) ? payload.results : []);
    } catch (e) {
      setLlmProbeError(e instanceof Error ? e.message : "Не удалось выполнить диагностику");
    } finally {
      setLlmProbeLoading(false);
    }
  }, []);

  const onExit = () => {
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
      <Card className="border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800/90">
        <CardContent className="space-y-3 pb-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Bot className="h-4 w-4 text-slate-500" />
                Диагностика AI в чате
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Проверка ключей и ответа провайдеров одним нажатием.
              </p>
            </div>
            <Button type="button" variant="secondary" className="h-8 rounded-xl px-3 text-xs" onClick={runLlmDiagnostics} disabled={llmProbeLoading}>
              {llmProbeLoading ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Проверка
                </>
              ) : (
                "Проверить"
              )}
            </Button>
          </div>
          {llmProbeError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{llmProbeError}</div> : null}
          {llmProbeResults.length > 0 ? (
            <div className="space-y-2">
              {llmProbeResults.map((item) => (
                <div
                  key={`llm-probe-${item.provider}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">{item.provider}</div>
                    <div className={cn("inline-flex items-center gap-1 text-xs font-semibold", item.ok ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")}>
                      {item.ok ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleX className="h-3.5 w-3.5" />}
                      {item.ok ? "OK" : "Ошибка"}
                    </div>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                    Модель: <span className="font-medium">{item.model}</span>
                    {typeof item.httpStatus === "number" ? ` · HTTP ${item.httpStatus}` : ""}
                  </div>
                  {!item.ok ? <div className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">{item.message}</div> : null}
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

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
