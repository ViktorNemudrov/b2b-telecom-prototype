"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Headphones, LayoutGrid } from "lucide-react";
import { cn } from "@shared/components/ui/cn";
import { useDocumentsSheet } from "@shared/components/DocumentsSheetProvider";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";

const tabClass = (active: boolean) =>
  `flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-3 text-[10px] font-semibold transition ${
    active
      ? "text-accent-orange dark:text-accent-orange"
      : "text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
  }`;

export function ClassicBottomTabBar() {
  const pathname = usePathname() ?? "";
  const documentsSheet = useDocumentsSheet();

  const servicesNav = useUiCustomization("classic.widgets.bottom.services");
  const documentsNav = useUiCustomization("classic.widgets.bottom.documents");
  const supportNav = useUiCustomization("classic.widgets.bottom.support");

  const pathNorm = pathname.replace(/\/$/, "") || "/";
  const isDocumentsRoute = pathNorm === "/documents" || pathNorm.startsWith("/documents/");
  const isWidgets = pathname === "/widgets" || pathname.startsWith("/widgets/");
  const isDocuments =
    documentsSheet.open || pathname === "/documents" || pathname.startsWith("/documents/");
  const isSupport = pathname === "/support" || pathname.startsWith("/support/");

  if (!isWidgets) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] border-t border-[rgb(var(--border))] bg-[rgb(var(--bg))]/97 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Основное меню"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        <Link
          href="/widgets/"
          data-testid="classic-bottom-nav-services"
          className={cn(tabClass(isWidgets), getCustomizationButtonClasses(servicesNav.dimmedDisabled))}
          aria-current={isWidgets ? "page" : undefined}
          onClick={(e) => {
            documentsSheet.closeDocumentsSheet();
            if (servicesNav.dimmedDisabled) {
              e.preventDefault();
              return;
            }
            if (servicesNav.useMock) {
              e.preventDefault();
              openDevelopmentStub("Раздел «Сервисы» (мок из кастомизации).");
            }
          }}
        >
          <div className={cn(
            "flex h-6 w-6 items-center justify-center rounded-xl transition",
            isWidgets && "bg-accent-orange/15 dark:bg-accent-orange/20"
          )}>
            <LayoutGrid className="h-4.5 w-4.5 shrink-0" aria-hidden />
          </div>
          <span className="truncate">Сервисы</span>
        </Link>
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
          <div className={cn(
            "flex h-6 w-6 items-center justify-center rounded-xl transition",
            isDocuments && "bg-accent-orange/15 dark:bg-accent-orange/20"
          )}>
            <FileText className="h-4.5 w-4.5 shrink-0" aria-hidden />
          </div>
          <span className="truncate">Документы</span>
        </Link>
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
          <div className={cn(
            "flex h-6 w-6 items-center justify-center rounded-xl transition",
            isSupport && "bg-accent-orange/15 dark:bg-accent-orange/20"
          )}>
            <Headphones className="h-4.5 w-4.5 shrink-0" aria-hidden />
          </div>
          <span className="truncate">Поддержка</span>
        </Link>
      </div>
    </nav>
  );
}
