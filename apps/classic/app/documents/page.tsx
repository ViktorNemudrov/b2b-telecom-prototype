"use client";

import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@shared/components/ui/card";
import { ChevronRight } from "lucide-react";
const sections = [
  { href: "/invoices", title: "Счета", desc: "Как в AI-ветке: статусы, PDF, оплата" },
  { href: "/documents/payments", title: "Платежи", desc: "История и фильтры (мок)" },
  { href: "/documents/contracts", title: "Договоры", desc: "Список договоров (мок)" }
];

export default function DocumentsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px space-y-4 pb-6 pt-4">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Документы</h1>
          <div className="space-y-3">
            {sections.map((s) => (
              <Link key={s.href} href={s.href}>
                <Card className="transition hover:brightness-[1.02] dark:border-slate-700">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.title}</div>
                      <div className="text-xs text-slate-500">{s.desc}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </AppShell>
    </>
  );
}
