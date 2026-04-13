"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Headphones, Home, LayoutGrid, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@shared/components/ui/cn";

const items = [
  { href: "/", label: "Главная", Icon: Home },
  { href: "/products", label: "Мои продукты", Icon: LayoutGrid },
  { href: "/communication", label: "Связь", Icon: MessageCircle },
  { href: "/assistant", label: "AI", Icon: Sparkles },
  { href: "/documents", label: "Документы", Icon: FileText },
  { href: "/support", label: "Поддержка", Icon: Headphones }
];

export function BottomNav() {
  const pathname = usePathname();
  const onCallRoute = pathname?.startsWith("/call/");
  const hideNav = pathname === "/auth" || onCallRoute || pathname === "/settings";

  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[430px]">
      <div className="safe-px pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
        <div className="flex items-stretch justify-between gap-0.5 rounded-[26px] border border-slate-200/90 bg-white/95 px-1 py-2 shadow-soft backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          {items.map(({ href, label, Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : href === "/communication"
                  ? pathname === "/communication"
                  : pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[9px] font-semibold transition active:scale-[0.98]",
                  active ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                <span className="relative flex h-7 w-7 items-center justify-center">
                  <Icon className={cn("h-4 w-4", active && "text-slate-900 dark:text-slate-100")} />
                </span>
                <span className="max-w-[3.25rem] truncate leading-tight">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
