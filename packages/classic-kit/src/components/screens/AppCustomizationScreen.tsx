"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { CenteredPageTitleBar } from "@shared/components/CenteredPageTitleBar";
import { Card, CardContent } from "@shared/components/ui/card";
import { cn } from "@shared/components/ui/cn";
import {
  customizableElements,
  useUiCustomization,
  type AppCustomizationVariant,
  type CustomizableElementId
} from "@shared/lib/uiCustomization";

function Toggle({
  value,
  onChange,
  label
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      className={cn("relative h-7 w-12 rounded-full transition", value ? "bg-accent-yellow" : "bg-slate-300 dark:bg-slate-600")}
      onClick={() => onChange(!value)}
    >
      <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition", value ? "right-1" : "left-1")} />
    </button>
  );
}

function CustomizationRow({
  elementId,
  label,
  description
}: {
  elementId: CustomizableElementId;
  label: string;
  description: string;
}) {
  const customization = useUiCustomization(elementId);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</div>
        <button
          type="button"
          className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label={expanded ? "Свернуть описание" : "Развернуть описание"}
          onClick={() => setExpanded((v) => !v)}
        >
          <ChevronDown className={cn("h-4 w-4 transition", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded ? (
        <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs leading-relaxed text-slate-600 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-300">
          {description}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-lg border border-slate-100 p-2 dark:border-slate-700">
          <span className="text-[11px] text-slate-500 dark:text-slate-300">Мок вместо перехода</span>
          <Toggle value={customization.useMock} onChange={customization.setUseMock} label={`${label}: мок`} />
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-slate-100 p-2 dark:border-slate-700">
          <span className="text-[11px] text-slate-500 dark:text-slate-300">Блеклый и неактивный</span>
          <Toggle
            value={customization.dimmedDisabled}
            onChange={customization.setDimmedDisabled}
            label={`${label}: отключить визуально`}
          />
        </div>
      </div>
    </div>
  );
}

export function AppCustomizationScreen({
  backHref = "/settings/",
  appVariant
}: {
  backHref?: string;
  appVariant: AppCustomizationVariant;
}) {
  const filteredElements = React.useMemo(
    () => customizableElements.filter((item) => item.app === appVariant),
    [appVariant]
  );

  return (
    <div className="safe-px mx-auto max-w-[760px] space-y-4 pb-8 pt-2">
      <CenteredPageTitleBar title="Кастомизация приложения" backHref={backHref} titleClassName="text-base font-semibold" />

      <Card>
        <CardContent className="space-y-2 pb-4 pt-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Для каждого элемента доступны два режима: мок-действие и визуальное отключение без клика.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filteredElements.map((item) => (
          <CustomizationRow
            key={item.id}
            elementId={item.id}
            label={item.label}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
}
