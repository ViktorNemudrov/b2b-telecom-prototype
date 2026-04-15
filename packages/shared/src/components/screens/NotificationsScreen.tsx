"use client";

import Link from "next/link";
import { Bell, ChevronLeft, CircleAlert, FileText, MessageCircleWarning, PhoneMissed, Sparkles } from "lucide-react";
import { Card, CardContent } from "@shared/components/ui/card";
import { getAppealsFiltered, standaloneCalls } from "@shared/lib/mockData";
import { useRuntimeInvoices } from "@shared/lib/runtimeInvoices";
import { goSmartBack } from "@shared/lib/smartBack";
import { useRouter } from "next/navigation";

export function NotificationsScreen({ backHref = "/settings/" }: { backHref?: string }) {
  const router = useRouter();
  const runtimeInvoices = useRuntimeInvoices();
  const unpaidCount = runtimeInvoices.filter((inv) => inv.status === "pay").length;
  const missedCount = standaloneCalls.filter((c) => c.missed).length;
  const activeAppeals = getAppealsFiltered("all").filter((a) => a.status === "active").length;

  const rows = [
    {
      id: "unpaid",
      title: "Неоплаченные счета",
      subtitle: `${unpaidCount} требуют действия`,
      icon: <FileText className="h-4 w-4 text-amber-600" />,
      href: "/assistant/?q=Покажи неоплаченные счета и варианты оплаты"
    },
    {
      id: "missed",
      title: "Пропущенные звонки",
      subtitle: `${missedCount} пропущенных`,
      icon: <PhoneMissed className="h-4 w-4 text-rose-600" />,
      href: "/assistant/?q=Покажи пропущенные звонки и что делать дальше"
    },
    {
      id: "weekly",
      title: "Еженедельный отчет",
      subtitle: "Сводка по звонкам и рискам",
      icon: <Sparkles className="h-4 w-4 text-violet-600" />,
      href: "/assistant/?q=Покажи еженедельный отчет по звонкам и оплатам"
    },
    {
      id: "appeals",
      title: "Обращения",
      subtitle: `${activeAppeals} активных`,
      icon: <MessageCircleWarning className="h-4 w-4 text-sky-600" />,
      href: "/appeals/"
    }
  ];

  return (
    <div className="space-y-4 pb-8">
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        onClick={() => goSmartBack(router, backHref)}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
          <ChevronLeft className="h-4 w-4" />
        </span>
        Назад
      </button>

      <Card>
        <CardContent className="space-y-2 pb-4 pt-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Bell className="h-4 w-4" />
            <h1 className="text-base font-semibold">Уведомления</h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">Здесь собраны действия, которые требуют внимания.</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {rows.map((row) => (
          <Link key={row.id} href={row.href} className="block">
            <Card className="transition hover:brightness-[1.01]">
              <CardContent className="flex items-center gap-3 py-3">
                <span className="rounded-full bg-slate-100 p-2 dark:bg-slate-700">{row.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{row.subtitle}</div>
                </div>
                <CircleAlert className="h-4 w-4 text-slate-400" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
