"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";
import { HomeDashboardScreen } from "@shared/components/screens/HomeDashboardScreen";

/**
 * Экран «Виджеты» по макету `Поддержка_список_классика.png`: дашборд подписки и карточек
 * + кнопки «Добавить продукт» / «Помощник». Нижняя панель — в {@link ClassicBottomTabBar}.
 */
export function WidgetsScreen() {
  const addCustom = useUiCustomization("classic.widgets.addProduct");
  const assistantCustom = useUiCustomization("classic.widgets.assistant");
  const recordingsCustom = useUiCustomization("classic.widgets.recordings");

  return (
    <div className="space-y-4">
      <HomeDashboardScreen
        recordingsTap={{
          useMock: recordingsCustom.useMock,
          dimmedDisabled: recordingsCustom.dimmedDisabled
        }}
      />

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
    </div>
  );
}
