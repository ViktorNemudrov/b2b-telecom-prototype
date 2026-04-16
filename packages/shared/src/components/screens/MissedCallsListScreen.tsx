"use client";

import * as React from "react";
import { Volume2 } from "lucide-react";
import { CommunicationLogRow } from "@shared/components/CommunicationLogRow";
import { PageBackLink } from "@shared/components/PageBackLink";
import { communicationLogMock } from "@shared/lib/dashboardMock";
import { markMissedCallsSeen } from "@shared/lib/runtimeFlags";

export function MissedCallsListScreen() {
  const groups = React.useMemo(() => {
    const m = new Map<string, typeof communicationLogMock>();
    for (const row of communicationLogMock) {
      if (!m.has(row.dateGroup)) m.set(row.dateGroup, []);
      m.get(row.dateGroup)!.push(row);
    }
    return Array.from(m.entries());
  }, []);

  React.useEffect(() => {
    markMissedCallsSeen();
  }, []);

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
          У вас 6 пропущенных звонков, которые требуется обработать.
        </p>
        <button
          type="button"
          className="shrink-0 rounded-full border border-slate-200 p-2 dark:border-slate-600"
          aria-label="Озвучить"
          onClick={() => {
            if (!("speechSynthesis" in window)) return;
            const u = new SpeechSynthesisUtterance(
              "У вас 6 пропущенных звонков, которые требуется обработать."
            );
            u.lang = "ru-RU";
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(u);
          }}
        >
          <Volume2 className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-800">
        {groups.map(([date, rows]) => (
          <div key={date}>
            <div className="border-b border-slate-100 px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-600">
              {date}
            </div>
            <div className="divide-y divide-slate-100 px-2 dark:divide-slate-600">
              {rows.map((row) => (
                <CommunicationLogRow key={row.id} row={row} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <PageBackLink href="/assistant/" />
    </div>
  );
}
