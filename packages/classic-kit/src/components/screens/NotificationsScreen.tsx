"use client";

import Link from "next/link";
import { CircleAlert, FileText, MessageCircleWarning, PhoneMissed, Sparkles } from "lucide-react";
import { Card, CardContent } from "@shared/components/ui/card";
import { appealsListHref } from "@shared/lib/appealsBackFallback";
import { PageBackLink } from "@shared/components/PageBackLink";
import { getAppealsFiltered, standaloneCalls } from "@shared/lib/mockData";
import { useRuntimeInvoices } from "@shared/lib/runtimeInvoices";

export function NotificationsScreen({ backHref = "/settings/" }: { backHref?: string }) {
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
      href: appealsListHref("settings")
    }
  ];

  return (
    <div className="pb-8 pt-0">
      <div className="space-y-0.5">
        <div className="relative flex min-h-8 items-center justify-center">
          <PageBackLink href={backHref} className="absolute left-0 mb-0 h-8 w-8 p-0 leading-none" />
          <h1 className="text-center text-lg font-bold text-[rgb(var(--text))]">Уведомления</h1>
        </div>
        <p className="text-center text-sm text-[rgb(var(--muted))]">Здесь собраны действия, которые требуют внимания.</p>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <Link key={row.id} href={row.href} className="block">
            <Card className="transition hover:brightness-[1.01]">
              <CardContent className="flex items-center gap-3 py-3">
                <span className="rounded-full bg-[rgb(var(--surface-2))] p-2700">{row.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[rgb(var(--text))]">{row.title}</div>
                  <div className="text-xs text-[rgb(var(--muted))]">{row.subtitle}</div>
                </div>
                <CircleAlert className="h-4 w-4 text-[rgb(var(--muted))]" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
