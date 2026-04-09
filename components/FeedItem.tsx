"use client";

import type { FeedItem as FeedItemT } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BarChart3, Calendar, Sparkles } from "lucide-react";
import { RecordingPlayer } from "@/components/RecordingPlayer";
import { CallSummaryCard } from "@/components/CallSummaryCard";

export function FeedItem({
  item,
  expandedTranscript,
  onToggleTranscript,
  onAction
}: {
  item: FeedItemT;
  expandedTranscript: boolean;
  onToggleTranscript: (id: string) => void;
  onAction: (action: { type: "pay" | "report" }) => void;
}) {
  if (item.kind === "call") {
    const c = item.call;
    return (
      <Card>
        <CardContent className="pb-4 pt-4">
          <CallSummaryCard
            call={c}
            expanded={expandedTranscript}
            onToggleTranscript={() => onToggleTranscript(item.id)}
          />

          {c.recordingUrl ? (
            <div className="mt-4">
              <RecordingPlayer src={c.recordingUrl} fileName={`${c.id}.wav`} />
            </div>
          ) : null}

          {expandedTranscript ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-800">
              {c.transcript}
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (item.kind === "tariff") {
    const s = item.stats;
    const Row = ({ label, used, total }: { label: string; used: number; total: number }) => {
      const pct = total > 0 ? Math.min(1, used / total) : 0;
      return (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{label}</span>
            <span className="font-semibold text-slate-700">
              {used}/{total}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-accent-teal to-accent-violet"
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        </div>
      );
    };

    return (
      <Card>
        <CardContent className="pb-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
              <BarChart3 className="h-5 w-5 text-slate-700" />
            </div>
            <div className="text-sm font-semibold text-slate-900">Статистика тарифа</div>
          </div>
          <div className="mt-4 space-y-4">
            <Row label="GB" used={s.gbUsed} total={s.gbTotal} />
            <Row label="Минуты" used={s.minutesUsed} total={s.minutesTotal} />
            <Row label="SMS" used={s.smsUsed} total={s.smsTotal} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (item.kind === "alert") {
    return (
      <Card>
        <CardContent className="pb-4 pt-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-900">{item.title}</div>
              <div className="mt-1 text-sm text-slate-700">{item.description}</div>
            </div>
          </div>
          <div className="mt-4">
            <Button className="w-full" onClick={() => onAction({ type: "pay" })}>
              {item.cta}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (item.kind === "summary") {
    return (
      <Card>
        <CardContent className="pb-4 pt-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
              <Calendar className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{item.title}</div>
              <div className="mt-1 text-sm text-slate-700">{item.description}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // tool
  return (
    <Card>
      <CardContent className="pb-4 pt-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-violet/15 to-accent-teal/15">
            <Sparkles className="h-5 w-5 text-accent-teal" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900">{item.title}</div>
            <div className="mt-1 text-sm text-slate-700">{item.description}</div>
          </div>
        </div>
        <div className="mt-4">
          <Button className="w-full" onClick={() => onAction({ type: "report" })}>
            {item.cta}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

