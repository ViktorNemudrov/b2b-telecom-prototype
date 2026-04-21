"use client";

import Link from "next/link";
import { useDocumentsSheet } from "@shared/components/DocumentsSheetProvider";
import { cn } from "@shared/components/ui/cn";
import { CLASSIC_DOCUMENT_TILES } from "@shared/components/screens/classicDocumentsTiles";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

/** Экран «Документы» по макету `Документы.png`: сетка разделов 2×3; плитки ведут на реальные экраны прототипа. */
const tiles = CLASSIC_DOCUMENT_TILES;

export function ClassicDocumentsScreen() {
  const documentsSheet = useDocumentsSheet();

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
          const tileContent = (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm dark:bg-slate-700 dark:text-slate-100">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex w-full items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.label}
                {typeof t.badge === "number" ? (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-900 px-1 text-[11px] font-bold text-white dark:bg-slate-200 dark:text-slate-900">
                    {t.badge}
                  </span>
                ) : null}
              </span>
            </>
          );

          if (t.mockHint) {
            return (
              <button
                key={t.id}
                type="button"
                data-testid={`documents-tile-${t.id}`}
                className={tileClass}
                onClick={() => {
                  // Закрываем лист «Документы», чтобы «Мок» открывался в одном модальном окне.
                  documentsSheet.closeDocumentsSheet();
                  window.setTimeout(() => openDevelopmentStub(t.mockHint), 60);
                }}
              >
                {tileContent}
              </button>
            );
          }

          return (
            <Link
              key={t.id}
              href={t.href}
              data-testid={`documents-tile-${t.id}`}
              className={tileClass}
            >
              {tileContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
