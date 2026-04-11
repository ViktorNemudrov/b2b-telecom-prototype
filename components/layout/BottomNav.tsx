"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Headphones, Home, LayoutGrid, MapPin } from "lucide-react";
import { cn } from "@/components/ui/cn";

const items = [
  { href: "/", label: "Главная", Icon: Home },
  { href: "/assistant", label: "Сервисы", Icon: LayoutGrid },
  { href: "/documents", label: "Документы", Icon: FileText },
  { href: "/sphere", label: "Сфера", Icon: MapPin, badge: "PRO" as const },
  { href: "/support", label: "Поддержка", Icon: Headphones }
];

export function BottomNav() {
  const pathname = usePathname();
  const onCallRoute = pathname?.startsWith("/call/");

  if (onCallRoute) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[430px]">
      <div className="safe-px pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
        <div className="flex items-stretch justify-between gap-1 rounded-[26px] border border-slate-200/90 bg-white/95 px-2 py-2 shadow-soft backdrop-blur">
          {items.map(({ href, label, Icon, badge }) => {
            const active =
              href === "/"
                ? pathname === "/" || pathname === "/communication"
                : pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-semibold transition active:scale-[0.98]",
                  active ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <span className="relative flex h-8 w-8 items-center justify-center">
                  <Icon className={cn("h-5 w-5", active && "text-slate-900")} />
                  {badge ? (
                    <span className="absolute -right-0.5 -top-0.5 rounded bg-accent-dark px-1 text-[7px] font-bold uppercase leading-none text-accent-yellow">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span className="max-w-[4.5rem] truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
