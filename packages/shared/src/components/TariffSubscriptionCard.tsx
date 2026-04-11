"use client";

import { openDevelopmentStub } from "@shared/lib/developmentStub";
import type { TariffStats } from "@shared/lib/mockData";
import { Card, CardContent } from "@shared/components/ui/card";
import { BarChart3, Infinity, Settings } from "lucide-react";

export function TariffSubscriptionCard({ stats: s }: { stats: TariffStats }) {
  const gbPct = s.gbTotal > 0 ? Math.min(1, s.gbUsed / s.gbTotal) : 0;
  const smsPct = s.smsTotal > 0 ? Math.min(1, s.smsUsed / s.smsTotal) : 0;

  return (
    <Card>
      <CardContent className="pb-4 pt-4">
        <p className="text-xs font-medium text-slate-500">Входит в вашу подписку</p>
        <div className="mt-1 flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-900">Связь для бизнеса</h3>
          <button
            type="button"
            onClick={() => openDevelopmentStub("Настройки и параметры тарифа.")}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Настройки тарифа"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="relative col-span-2 flex min-h-[128px] flex-col justify-between overflow-hidden rounded-[20px] border border-slate-100 bg-slate-50 p-4">
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
            <div className="relative text-xs font-medium text-slate-500">Минуты</div>
            <div className="relative">
              <div className="text-3xl font-semibold tracking-tight text-slate-900">{s.minutesTotal} мин</div>
              <div className="mt-1 text-xs text-slate-600">использовано {s.minutesUsed}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-1 flex-col justify-between rounded-[20px] border border-slate-100 bg-white p-3 shadow-softSm">
              <div className="flex items-center justify-between text-slate-400">
                <Infinity className="h-5 w-5 text-accent-violet" />
                <span className="text-[10px] font-semibold uppercase text-slate-400">гб</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {s.gbUsed}/{s.gbTotal}
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${gbPct * 100}%` }} />
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between rounded-[20px] border border-slate-100 bg-white p-3 shadow-softSm">
              <div className="text-[10px] font-semibold uppercase text-slate-400">sms</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{s.smsUsed}</div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${smsPct * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <BarChart3 className="h-4 w-4 shrink-0 text-slate-400" />
          <span>
            Пакет: минуты {s.minutesUsed}/{s.minutesTotal}, данные {s.gbUsed}/{s.gbTotal} ГБ, SMS {s.smsUsed}/{s.smsTotal}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
