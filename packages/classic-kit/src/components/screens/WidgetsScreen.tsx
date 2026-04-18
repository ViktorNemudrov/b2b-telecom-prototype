"use client";

import { useRouter } from "next/navigation";
import {
  Bot,
  ChevronRight,
  Globe,
  Headphones,
  Mic,
  Phone,
  Sparkles,
  Tag,
  Wallet,
  Wrench
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { isCallRecordingProductLabel } from "@shared/lib/widgetProductHelpers";
import { subscriptionProductsMock } from "@shared/lib/mockData";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";
import { resolveProductTap } from "@shared/lib/widgetTapActions";

const productIconByTitle: Record<string, LucideIcon> = {
  "Сотовая связь": Phone,
  "Запись разговоров": Mic,
  Секретарь: Headphones,
  Этикетка: Tag,
  "ИИ-ассистенты": Bot,
  Продвижение: Sparkles,
  "Прием платежей": Wallet,
  "Конструктор сайтов": Globe
};

function iconForProduct(title: string): LucideIcon {
  return productIconByTitle[title] ?? Wrench;
}

function productTestId(title: string): string {
  if (isCallRecordingProductLabel(title)) return "widgets-product-recordings";
  return `widgets-product-${title.replace(/\s+/g, "-").toLowerCase()}`;
}

export function WidgetsScreen() {
  const router = useRouter();
  const addCustom = useUiCustomization("classic.widgets.addProduct");
  const assistantCustom = useUiCustomization("classic.widgets.assistant");
  const recordingsCustom = useUiCustomization("classic.widgets.recordings");

  const onProductClick = (title: string) => {
    const result = resolveProductTap(title, {
      useMock: recordingsCustom.useMock,
      dimmedDisabled: recordingsCustom.dimmedDisabled
    });
    if (result.kind === "none") return;
    if (result.kind === "stub") {
      openDevelopmentStub(result.message);
      return;
    }
    router.push("/call-recordings/");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Виджеты</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Подключённые продукты и сервисы</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          data-testid="widgets-add-product"
          variant="outline"
          className={cn(
            "rounded-full border-slate-200 bg-white text-sm font-semibold dark:border-slate-600 dark:bg-slate-800",
            getCustomizationButtonClasses(addCustom.dimmedDisabled)
          )}
          onClick={() => {
            if (addCustom.dimmedDisabled) return;
            openDevelopmentStub(
              addCustom.useMock
                ? "Добавление нового продукта (мок из кастомизации)."
                : "Добавление нового продукта в разработке."
            );
          }}
        >
          <span className="mr-1.5 text-base leading-none">+</span>
          Добавить новый продукт
        </Button>
        <Button
          type="button"
          data-testid="widgets-assistant"
          className={cn(
            "rounded-full bg-accent-dark text-sm font-semibold text-white shadow-softSm",
            getCustomizationButtonClasses(assistantCustom.dimmedDisabled)
          )}
          onClick={() => {
            if (assistantCustom.dimmedDisabled) return;
            openDevelopmentStub(
              assistantCustom.useMock
                ? "Помощник (мок из кастомизации)."
                : "Помощник в разработке."
            );
          }}
        >
          <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
          Помощник
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {subscriptionProductsMock.map((title) => {
          const Icon = iconForProduct(title);
          const isRec = isCallRecordingProductLabel(title);
          return (
            <button
              key={title}
              type="button"
              data-testid={productTestId(title)}
              onClick={() => onProductClick(title)}
              className={cn(
                "text-left",
                isRec && getCustomizationButtonClasses(recordingsCustom.dimmedDisabled)
              )}
            >
              <Card className="h-full border-slate-200/80 shadow-softSm transition hover:brightness-[1.02] active:translate-y-[1px] dark:border-slate-700">
                <CardContent className="flex min-h-[100px] flex-col justify-between gap-3 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-500" aria-hidden />
                  </div>
                  <div className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">{title}</div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
