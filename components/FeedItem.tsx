"use client";

import type { FeedItem as FeedItemT } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, Sparkles } from "lucide-react";
import { TariffSubscriptionCard } from "@/components/TariffSubscriptionCard";
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
            detailHref={`/call/${c.id}`}
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
    return <TariffSubscriptionCard stats={item.stats} />;
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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFEAFF]">
            <Sparkles className="h-5 w-5 text-accent-violet" />
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

