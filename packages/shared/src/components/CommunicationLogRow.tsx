"use client";

import Link from "next/link";
import type { CommLogRow } from "@shared/lib/dashboardMock";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { cn } from "@shared/components/ui/cn";

export function CommunicationLogRow({ row }: { row: CommLogRow }) {
  const subCls =
    row.variant === "waiting"
      ? "text-amber-600"
      : row.variant === "secretary"
        ? "text-rose-600"
        : "text-slate-600";

  const content = (
    <div className="flex items-start justify-between gap-3 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold leading-snug text-slate-900">{row.title}</div>
        <div className={cn("mt-1 text-sm", subCls)}>{row.subtitle}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {row.hasRecordingDot ? <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden /> : null}
          <span className="text-xs font-medium text-slate-600">{row.duration}</span>
        </div>
        <div className="mt-1 text-xs font-semibold text-slate-800">{row.time}</div>
      </div>
    </div>
  );

  if (row.callId) {
    return (
      <Link href={`/call/${row.callId}/`} className="-mx-1 block rounded-xl px-1 transition hover:bg-slate-50">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="-mx-1 block w-full rounded-xl px-1 text-left transition hover:bg-slate-50"
      onClick={() => openDevelopmentStub(`Карточка «${row.title}» — детальная карточка в CRM.`)}
    >
      {content}
    </button>
  );
}
