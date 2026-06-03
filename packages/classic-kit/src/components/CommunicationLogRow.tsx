"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CommLogRow } from "@shared/lib/dashboardMock";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { cn } from "@shared/components/ui/cn";

export function CommunicationLogRow({ row }: { row: CommLogRow }) {
  const subCls =
    row.variant === "waiting"
      ? "text-amber-600"
      : row.variant === "secretary"
        ? "text-rose-600 dark:text-rose-300"
        : "text-[rgb(var(--muted))]";

  const content = (
    <div className="flex items-start justify-between gap-3 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold leading-snug text-[rgb(var(--text))]">{row.title}</div>
        <div className={cn("mt-1 text-sm", subCls)}>{row.subtitle}</div>
      </div>
      <div className="flex shrink-0 items-start gap-1.5">
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-xs font-medium text-[rgb(var(--muted))]">{row.duration}</span>
          </div>
          <div className="mt-1 text-xs font-semibold text-[rgb(var(--text))]">{row.time}</div>
        </div>
        <ChevronRight
          className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--muted))]/50"
          aria-hidden
        />
      </div>
    </div>
  );

  if (row.callId) {
    return (
      <Link href={`/call/${row.callId}/`} className="-mx-1 block rounded-xl px-1 transition hover:bg-[rgb(var(--surface2))]">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="-mx-1 block w-full rounded-xl px-1 text-left transition hover:bg-[rgb(var(--surface2))]"
      onClick={() => openDevelopmentStub(`Карточка «${row.title}» — детальная карточка в CRM.`)}
    >
      {content}
    </button>
  );
}
