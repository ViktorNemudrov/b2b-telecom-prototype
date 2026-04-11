"use client";

import type { CallItem } from "@/lib/mockData";
import Link from "next/link";
import { ChevronRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallSummaryCard({
  call,
  expanded,
  onToggleTranscript,
  detailHref
}: {
  call: CallItem;
  expanded: boolean;
  onToggleTranscript: () => void;
  detailHref?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50">
          <PhoneCall className="h-5 w-5 text-slate-700" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">
              {call.time}, {call.phone}
            </div>
            <span className="rounded-full bg-accent-dark px-3 py-1 text-xs font-semibold text-white">
              {call.missed ? "Пропущенный: Филатов" : "Входящий: Филатов"}
            </span>
          </div>
          <div className="mt-1 text-sm text-slate-700">{call.summary}</div>
          {call.companyHint ? <div className="mt-2 text-xs text-slate-500">{call.companyHint}</div> : null}
          {detailHref ? (
            <Link
              href={detailHref}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-violet hover:underline"
            >
              Карточка звонка
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 rounded-full" onClick={onToggleTranscript}>
        {expanded ? "Свернуть" : "Расшифровка"}
      </Button>
    </div>
  );
}

