"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Headphones, Home, LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@shared/components/ui/cn";
import { useDocumentsSheet } from "@shared/components/DocumentsSheetProvider";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";

const tabClass = (active: boolean) =>
  `flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold transition ${
    active
      ? "text-accent-yellow dark:text-accent-yellow"
      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
  }`;

export function ClassicBottomTabBar() {
  const pathname = usePathname() ?? "";
  const documentsSheet = useDocumentsSheet();

  const homeNav = useUiCustomization("classic.widgets.bottom.home");
  const servicesNav = useUiCustomization("classic.widgets.bottom.services");
  const documentsNav = useUiCustomization("classic.widgets.bottom.documents");
  const sphereNav = useUiCustomization("classic.widgets.bottom.sphere");
  const supportNav = useUiCustomization("classic.widgets.bottom.support");

  const pathNorm = pathname.replace(/\/$/, "") || "/";
  const isDocumentsRoute = pathNorm === "/documents" || pathNorm.startsWith("/documents/");
  const isWidgets = pathname === "/widgets" || pathname.startsWith("/widgets/");
  const isDocuments =
    documentsSheet.open || pathname === "/documents" || pathname.startsWith("/documents/");
  const isSupport = pathname === "/support" || pathname.startsWith("/support/");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/95"
      aria-label="Основное меню"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        <Link
          href="/widgets/"
          data-testid="classic-bottom-nav-home"
          className={cn(tabClass(isWidgets), getCustomizationButtonClasses(homeNav.dimmedDisabled))}
          aria-current={isWidgets ? "page" : undefined}
          onClick={(e) => {
            documentsSheet.closeDocumentsSheet();
            if (homeNav.dimmedDisabled) {
              e.preventDefault();
              return;
            }
            if (homeNav.useMock) {
              e.preventDefault();
              openDevelopmentStub("Главная (мок из кастомизации).");
            }
          }}
        >
          <Home className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate">Главная</span>
        </Link>
        <button
          type="button"
          data-testid="classic-bottom-nav-services"
          className={cn(tabClass(false), getCustomizationButtonClasses(servicesNav.dimmedDisabled))}
          onClick={() => {
            documentsSheet.closeDocumentsSheet();
            if (servicesNav.dimmedDisabled) return;
            openDevelopmentStub(
              servicesNav.useMock
                ? "Раздел «Сервисы» (мок из кастомизации)."
                : "Раздел «Сервисы» в разработке."
            );
          }}
        >
          <LayoutGrid className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate">Сервисы</span>
        </button>
        <Link
          href="/documents/"
          data-testid="classic-bottom-nav-documents"
          className={cn(tabClass(isDocuments), getCustomizationButtonClasses(documentsNav.dimmedDisabled))}
          aria-current={isDocuments ? "page" : undefined}
          onClick={(e) => {
            if (documentsNav.dimmedDisabled) {
              e.preventDefault();
              return;
            }
            if (documentsNav.useMock) {
              e.preventDefault();
              openDevelopmentStub("Документы (мок из кастомизации).");
              return;
            }
            if (isDocumentsRoute) return;
            e.preventDefault();
            documentsSheet.toggleDocumentsSheet();
          }}
        >
          <FileText className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate">Документы</span>
        </Link>
        <button
          type="button"
          data-testid="classic-bottom-nav-sphere"
          className={cn(tabClass(false), getCustomizationButtonClasses(sphereNav.dimmedDisabled))}
          onClick={() => {
            documentsSheet.closeDocumentsSheet();
            if (sphereNav.dimmedDisabled) return;
            openDevelopmentStub(
              sphereNav.useMock ? "Раздел «Сфера» (мок из кастомизации)." : "Раздел «Сфера» в разработке."
            );
          }}
        >
          <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate">Сфера</span>
        </button>
        <Link
          href="/support/"
          data-testid="classic-bottom-nav-support"
          className={cn(tabClass(isSupport), getCustomizationButtonClasses(supportNav.dimmedDisabled))}
          aria-current={isSupport ? "page" : undefined}
          onClick={(e) => {
            documentsSheet.closeDocumentsSheet();
            if (supportNav.dimmedDisabled) {
              e.preventDefault();
              return;
            }
            if (supportNav.useMock) {
              e.preventDefault();
              openDevelopmentStub("Поддержка (мок из кастомизации).");
            }
          }}
        >
          <Headphones className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate">Поддержка</span>
        </Link>
      </div>
    </nav>
  );
}
