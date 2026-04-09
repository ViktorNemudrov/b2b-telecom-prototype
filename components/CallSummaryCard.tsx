"use client";

import type { CallItem } from "@/lib/mockData";
import { PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallSummaryCard({
  call,
  expanded,
  onToggleTranscript
}: {
  call: CallItem;
  expanded: boolean;
  onToggleTranscript: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
          <PhoneCall className="h-5 w-5 text-slate-700" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">
              {call.time}, {call.phone}
            </div>
            {call.missed ? (
              <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                пропущено
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                входящее
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-slate-700">{call.summary}</div>
          {call.companyHint ? <div className="mt-2 text-xs text-slate-500">{call.companyHint}</div> : null}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onToggleTranscript}>
        {expanded ? "Свернуть" : "Расшифровка"}
      </Button>
    </div>
  );
}

