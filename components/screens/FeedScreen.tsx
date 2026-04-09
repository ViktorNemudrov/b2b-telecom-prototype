"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { DatePickerModal } from "@/components/DatePickerModal";
import { FeedItem } from "@/components/FeedItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { feedDateLabel, feedItems } from "@/lib/mockData";

type FilterKey = "all" | "missed" | "incoming" | "reports";

const filterChips: { key: FilterKey; label: string }[] = [
  { key: "missed", label: "Пропущенные" },
  { key: "incoming", label: "Входящие" },
  { key: "reports", label: "Отчеты" }
];

export function FeedScreen() {
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [date, setDate] = React.useState(() => new Date("2026-04-14T10:00:00.000Z"));
  const [openDatePicker, setOpenDatePicker] = React.useState(false);
  const [expandedTranscriptById, setExpandedTranscriptById] = React.useState<Record<string, boolean>>({});
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const visible = React.useMemo(() => {
    if (filter === "all") return feedItems;
    if (filter === "missed") return feedItems.filter((i) => i.kind !== "call" || i.call.missed);
    if (filter === "incoming") return feedItems.filter((i) => i.kind === "call" && !i.call.missed);
    return feedItems.filter((i) => i.kind === "tool" || i.kind === "summary");
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">{feedDateLabel}</div>
            <div className="mt-0.5 text-xs text-slate-500">
              Фильтр:{" "}
              <span className="font-semibold text-slate-700">
                {filter === "all"
                  ? "Все"
                  : filterChips.find((c) => c.key === filter)?.label ?? "Все"}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOpenDatePicker(true)}>
            <Calendar className="h-4 w-4" /> Дата
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2 pb-1">
          <button
            onClick={() => setFilter("all")}
            className={[
              "min-w-0 rounded-full border px-2 py-2 text-xs font-semibold transition active:translate-y-[1px]",
              filter === "all"
                ? "border-transparent bg-gradient-to-r from-accent-teal to-accent-violet text-white shadow-softSm"
                : "border-slate-200 bg-white text-slate-800 shadow-softSm hover:bg-slate-50"
            ].join(" ")}
          >
            <span className="block truncate">Все</span>
          </button>
          {filterChips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={[
                "min-w-0 rounded-full border px-2 py-2 text-xs font-semibold transition active:translate-y-[1px]",
                filter === c.key
                  ? "border-transparent bg-gradient-to-r from-accent-teal to-accent-violet text-white shadow-softSm"
                  : "border-slate-200 bg-white text-slate-800 shadow-softSm hover:bg-slate-50"
              ].join(" ")}
            >
              <span className="block truncate">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((item) => (
          <FeedItem
            key={item.id}
            item={item}
            expandedTranscript={!!expandedTranscriptById[item.id]}
            onToggleTranscript={(id) =>
              setExpandedTranscriptById((p) => ({ ...p, [id]: !p[id] }))
            }
            onAction={(a) => {
              if (a.type === "pay") setToast("Пополнение: черновик платежа подготовлен.");
              if (a.type === "report") setToast("Отчет: сформирован черновик и отправка поставлена в очередь.");
            }}
          />
        ))}
      </div>

      {toast ? (
        <div className="fixed bottom-24 left-0 right-0 z-40 mx-auto w-full max-w-[430px]">
          <div className="safe-px">
            <Card className="border-slate-200">
              <CardContent className="pb-3 pt-3">
                <div className="text-sm text-slate-800">{toast}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      <DatePickerModal
        open={openDatePicker}
        onClose={() => setOpenDatePicker(false)}
        value={date}
        onChange={(d) => setDate(d)}
      />
    </div>
  );
}

