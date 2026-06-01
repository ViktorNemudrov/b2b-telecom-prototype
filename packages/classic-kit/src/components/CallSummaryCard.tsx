"use client";

import type { CallItem } from "@shared/lib/mockData";
import Link from "next/link";
import { ChevronRight, Phone, PhoneMissed } from "lucide-react";
import { Button } from "@shared/components/ui/button";

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
        {/* Иконка звонка */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
          call.missed ? "bg-rose-500/15" : "bg-accent-orange/15"
        }`}>
          {call.missed
            ? <PhoneMissed className="h-5 w-5 text-rose-500" />
            : <Phone className="h-5 w-5 text-accent-orange" />
          }
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-[rgb(var(--text))]">
              {call.time}, {call.phone}
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              call.missed
                ? "bg-rose-500/15 text-rose-500"
                : "bg-accent-orange/15 text-accent-orange"
            }`}>
              {call.missed ? "Пропущенный" : "Входящий"}
            </span>
          </div>
          <div className="mt-1 text-sm leading-snug text-[rgb(var(--muted))]">{call.summary}</div>
          {call.companyHint ? <div className="mt-1.5 text-xs text-[rgb(var(--muted))]">{call.companyHint}</div> : null}
          {detailHref ? (
            <Link
              href={detailHref}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-accent-orange hover:underline"
            >
              Карточка звонка
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 rounded-full text-xs" onClick={onToggleTranscript}>
        {expanded ? "Свернуть" : "Расшифровка"}
      </Button>
    </div>
  );
}

