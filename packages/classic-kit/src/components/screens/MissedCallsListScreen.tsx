"use client";

import * as React from "react";
import { Volume2 } from "lucide-react";
import { CommunicationLogRow } from "@shared/components/CommunicationLogRow";
import { PageBackLink } from "@shared/components/PageBackLink";
import { communicationLogMock } from "@shared/lib/dashboardMock";
import { missedCallsCount } from "@shared/lib/mockData";
import { markMissedCallsSeen } from "@shared/lib/runtimeFlags";

function missedCallsIntroText(count: number) {
  if (count === 1) return "У вас 1 пропущенный звонок, который требуется обработать.";
  if (count >= 2 && count <= 4) return `У вас ${count} пропущенных звонка, которые требуется обработать.`;
  return `У вас ${count} пропущенных звонков, которые требуется обработать.`;
}

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
        <p className="flex-1 text-sm leading-relaxed text-[rgb(var(--text))]100">
          {missedCallsIntroText(missedCallsCount)}
        </p>
        <button
          type="button"
          className="shrink-0 rounded-full border border-[rgb(var(--border))] p-2600"
          aria-label="Озвучить"
          onClick={() => {
            if (!("speechSynthesis" in window)) return;
            const u = new SpeechSynthesisUtterance(missedCallsIntroText(missedCallsCount));
            u.lang = "ru-RU";
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(u);
          }}
        >
          <Volume2 className="h-4 w-4 text-[rgb(var(--muted))]" />
        </button>
      </div>

      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]700800">
        {groups.map(([date, rows]) => (
          <div key={date}>
            <div className="border-b border-[rgb(var(--border))] px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-[rgb(var(--muted))]600">
              {date}
            </div>
            <div className="divide-y divide-[rgb(var(--border))] px-2 dark:divide-[rgb(var(--border))]">
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
