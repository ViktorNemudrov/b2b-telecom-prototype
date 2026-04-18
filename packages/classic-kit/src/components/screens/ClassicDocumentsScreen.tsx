"use client";

import Link from "next/link";
import {
  BarChart3,
  CreditCard,
  FileText,
  Layers,
  MessageCircle,
  Users
} from "lucide-react";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

/** Экран «Документы» по макету `Документы.png`: сетка разделов 2×3. */
const tiles = [
  { id: "fin", label: "Финансы", icon: CreditCard },
  { id: "contracts", label: "Договоры", icon: FileText },
  { id: "products", label: "Продукты", icon: Layers },
  { id: "reports", label: "Отчеты", icon: BarChart3 },
  { id: "users", label: "Пользователи", icon: Users },
  { id: "support", label: "Поддержка", icon: MessageCircle }
] as const;

export function ClassicDocumentsScreen() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Документы</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Разделы (демо по макету)</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          const tileClass = cn(
            "relative flex min-h-[112px] flex-col items-start justify-between rounded-2xl border border-slate-200/90 bg-slate-100/90 p-3 text-left shadow-sm transition",
            "hover:brightness-[1.02] active:translate-y-[1px] dark:border-slate-600 dark:bg-slate-800/80"
          );
          if (t.id === "fin") {
            return (
              <Link
                key={t.id}
                href="/documents/finance/"
                data-testid={`documents-tile-${t.id}`}
                className={tileClass}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm dark:bg-slate-700 dark:text-slate-100">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex w-full items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.label}
                </span>
              </Link>
            );
          }
          return (
            <button
              key={t.id}
              type="button"
              data-testid={`documents-tile-${t.id}`}
              onClick={() => openDevelopmentStub(`Раздел «${t.label}» в разработке.`)}
              className={tileClass}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm dark:bg-slate-700 dark:text-slate-100">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex w-full items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.label}
                {t.id === "support" ? (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-900 px-1 text-[11px] font-bold text-white dark:bg-slate-200 dark:text-slate-900">
                    1
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
