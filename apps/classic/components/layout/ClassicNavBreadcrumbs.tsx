"use client";

import { usePathname } from "next/navigation";

const SEP = " › ";

const SEGMENT_LABELS: Record<string, string> = {
  home: "Главная",
  assistant: "Ассистент",
  widgets: "Сервисы",
  documents: "Документы",
  finance: "Финансы",
  settings: "Настройки",
  subscription: "Подписка",
  onboarding: "Онбординг",
  faq: "FAQ",
  customization: "Оформление",
  appeals: "Апелляции",
  support: "Поддержка",
  invoices: "Счета",
  communication: "Коммуникации",
  notifications: "Уведомления",
  "missed-calls": "Пропущенные",
  qa: "Q&A",
  sphere: "Сфера",
  call: "Звонок",
  chat: "Чат",
  auth: "Вход",
  events: "События"
};

function looksLikeOpaqueRouteId(segment: string): boolean {
  if (/^\d+$/.test(segment)) return true;
  if (segment.length >= 12 && /^[a-f0-9-]+$/i.test(segment)) return true;
  return false;
}

function labelForSegment(segment: string, parent: string | undefined): string {
  const mapped = SEGMENT_LABELS[segment];
  if (mapped) return mapped;
  if (parent && looksLikeOpaqueRouteId(segment)) {
    if (parent === "invoices") return "Карточка";
    if (parent === "call") return "Детали";
  }
  return segment;
}

function trailFromPathname(pathname: string): string {
  const norm = (pathname ?? "").replace(/\/$/, "") || "/";
  if (norm === "/") return "Старт";

  const parts = norm.split("/").filter(Boolean);
  if (parts.length === 0) return "Старт";

  const labels: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const parent = i > 0 ? parts[i - 1] : undefined;
    labels.push(labelForSegment(parts[i]!, parent));
  }
  return labels.join(SEP);
}

function pathHasBottomTabBar(pathname: string): boolean {
  const p = (pathname ?? "").replace(/\/$/, "") || "/";
  if (p === "/assistant") return false;
  if (p.startsWith("/assistant/")) return false;
  return true;
}

export function ClassicNavBreadcrumbs() {
  const pathname = usePathname() ?? "";
  const trail = trailFromPathname(pathname);
  const tabBar = pathHasBottomTabBar(pathname);

  return (
    <nav
      aria-label="Текущий путь в приложении"
      className={
        tabBar
          ? "pointer-events-none fixed bottom-[calc(4.1rem+env(safe-area-inset-bottom))] left-1/2 z-[35] w-full max-w-[430px] -translate-x-1/2 px-3"
          : "pointer-events-none fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-1/2 z-[35] w-full max-w-[430px] -translate-x-1/2 px-3"
      }
    >
      <p className="text-left text-[10px] font-medium leading-snug tracking-wide text-slate-600 dark:text-slate-400">
        {trail}
      </p>
    </nav>
  );
}
