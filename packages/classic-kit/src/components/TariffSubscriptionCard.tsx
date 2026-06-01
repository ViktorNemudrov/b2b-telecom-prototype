"use client";

import { openDevelopmentStub } from "@shared/lib/developmentStub";
import type { TariffStats } from "@shared/lib/mockData";
import { Card, CardContent } from "@shared/components/ui/card";
import { BarChart3, Cloud, Infinity, Settings } from "lucide-react";

export function TariffSubscriptionCard({ stats: s }: { stats: TariffStats }) {
  const gbPct = s.gbTotal > 0 ? Math.min(1, s.gbUsed / s.gbTotal) : 0;
  const smsPct = s.smsTotal > 0 ? Math.min(1, s.smsUsed / s.smsTotal) : 0;

  return (
    <Card className="border-[rgb(var(--border))] ">
      <CardContent className="pb-4 pt-4">
        <p className="text-xs font-medium text-[rgb(var(--muted))]">Входит в вашу подписку</p>
        <div className="mt-1 flex items-center gap-2">
          <h3 className="text-base font-semibold text-[rgb(var(--text))]">Связь для бизнеса</h3>
          <button
            type="button"
            onClick={() => openDevelopmentStub("Настройки и параметры тарифа.")}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--muted))] transition hover:brightness-105 "
            aria-label="Настройки тарифа"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="relative col-span-2 flex min-h-[128px] flex-col justify-between overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] p-4 ">
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                backgroundImage: [
                  "radial-gradient(circle at 18% 28%, rgba(250, 204, 21, 0.45) 0, transparent 42%)",
                  "radial-gradient(circle at 72% 18%, rgba(148, 163, 184, 0.35) 0, transparent 38%)",
                  "radial-gradient(circle at 40% 78%, rgba(250, 204, 21, 0.25) 0, transparent 40%)",
                  "radial-gradient(circle at 88% 72%, rgba(148, 163, 184, 0.28) 0, transparent 45%)"
                ].join(",")
              }}
            />
            <div className="relative text-xs font-medium text-[rgb(var(--muted))]">Минуты</div>
            <div className="relative">
              <div className="text-3xl font-semibold tracking-tight text-[rgb(var(--text))]">
                {s.minutesTotal} мин
              </div>
              <div className="mt-1 text-xs text-[rgb(var(--muted))]">использовано {s.minutesUsed}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-1 flex-col justify-between rounded-[20px] border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 shadow-softSm ">
              <div className="flex items-center justify-between text-[rgb(var(--muted))]">
                <Infinity className="h-5 w-5 text-accent-orange" />
                <span className="text-[10px] font-semibold uppercase text-[rgb(var(--muted))]">гб</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-[rgb(var(--text))]">
                {s.gbUsed}/{s.gbTotal}
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[rgb(var(--surface-2))]">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${gbPct * 100}%` }} />
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between rounded-[20px] border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 shadow-softSm ">
              <div className="text-[10px] font-semibold uppercase text-[rgb(var(--muted))]">sms</div>
              <div className="mt-1 text-sm font-semibold text-[rgb(var(--text))]">{s.smsUsed}</div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[rgb(var(--surface-2))]">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${smsPct * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-[rgb(var(--border))] pt-3 text-xs text-[rgb(var(--muted))]">
          <BarChart3 className="h-4 w-4 shrink-0 text-[rgb(var(--muted))]" />
          <span>
            Пакет: минуты {s.minutesUsed}/{s.minutesTotal}, данные {s.gbUsed}/{s.gbTotal} ГБ, SMS {s.smsUsed}/{s.smsTotal}
          </span>
          <button
            type="button"
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgb(var(--border))] text-[rgb(var(--muted))] transition hover:brightness-105"
            aria-label="Что можно сделать с остатком"
            onClick={() => openDevelopmentStub("Ассистент: подскажи, как оптимизировать остаток по пакету.")}
          >
            <Cloud className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
