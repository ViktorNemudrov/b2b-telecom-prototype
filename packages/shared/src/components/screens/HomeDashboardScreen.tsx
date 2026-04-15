"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Sparkles } from "lucide-react";
import { TariffSubscriptionCard } from "@shared/components/TariffSubscriptionCard";
import { TargetMailingModal } from "@shared/components/TargetMailingModal";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { dashboardLines } from "@shared/lib/dashboardMock";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { getTariffFromFeed } from "@shared/lib/mockData";

const aiAvatars = ["AI", "GPT", "Claude", "CRM", "Отчёты"];

function CallHeatmap() {
  const cols = 14;
  const rows = 7;
  const colors = ["bg-slate-800", "bg-slate-300", "bg-accent-yellow", "bg-amber-400", "bg-rose-500"];
  return (
    <div className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const c = colors[i % colors.length];
        const taper = i % cols > (i / rows) * 0.8;
        return <div key={i} className={`aspect-square rounded-full ${taper ? c : "bg-slate-200"}`} />;
      })}
    </div>
  );
}

export function HomeDashboardScreen() {
  const router = useRouter();
  const [mailingOpen, setMailingOpen] = React.useState(false);
  const tariff = getTariffFromFeed();

  return (
    <div className="space-y-4 pb-2">
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-dark px-4 py-2 text-xs font-semibold text-white shadow-softSm">
          <span className="text-accent-yellow">✓</span> Подписка
        </span>
      </div>

      {tariff ? <TariffSubscriptionCard stats={tariff} /> : null}

      <Card>
        <CardContent className="pb-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Мои номера</h2>
            <button
              type="button"
              onClick={() => openDevelopmentStub("Управление номерами (демо).")}
              className="text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              aria-label="Ещё"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-700">
            {dashboardLines.map((line) => {
              const gbPct = line.gbMax ? line.gb / line.gbMax : 0;
              const minPct = line.minMax ? line.min / line.minMax : 0;
              const smsPct = line.smsMax ? line.sms / line.smsMax : 0;
              return (
                <div
                  key={line.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openDevelopmentStub(`Линия ${line.phone}: детали (демо).`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDevelopmentStub(`Линия ${line.phone}: детали (демо).`);
                    }
                  }}
                  className="flex cursor-pointer items-center gap-3 py-3 first:pt-1"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{line.phone}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{line.name}</div>
                    <div className="mt-2 flex gap-2">
                      <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-2 py-1.5 dark:bg-slate-700/50">
                        <div className="text-[10px] font-semibold text-slate-500">{line.gb} гб</div>
                        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full bg-emerald-500" style={{ width: `${gbPct * 100}%` }} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-2 py-1.5 dark:bg-slate-700/50">
                        <div className="text-[10px] font-semibold text-slate-500">{line.min} мин</div>
                        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full bg-amber-500" style={{ width: `${minPct * 100}%` }} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-2 py-1.5 dark:bg-slate-700/50">
                        <div className="text-[10px] font-semibold text-slate-500">{line.sms} смс</div>
                        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full bg-rose-400" style={{ width: `${smsPct * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-500" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pb-4 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Записи разговоров</h2>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">24.05</span>
                <span className="h-2 w-2 rounded-full bg-rose-500" />
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <span>
                  <span className="font-semibold text-slate-800">245</span>{" "}
                  <span className="text-slate-500">принято</span>
                </span>
                <span>
                  <span className="font-semibold text-amber-600">12</span>{" "}
                  <span className="text-slate-500">ждут ответа</span>
                </span>
                <span>
                  <span className="font-semibold text-rose-600">16</span>{" "}
                  <span className="text-slate-500">секретарь</span>
                </span>
              </div>
            </div>
            <Link
              href="/communication"
              className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Все
            </Link>
          </div>
          <CallHeatmap />
          <div className="mt-2 flex justify-between px-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {["8", "10", "12", "14", "16", "18"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pb-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">AI — команда</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ваши помощники 24/7</p>
            </div>
            <button
              type="button"
              onClick={() => openDevelopmentStub("Каталог AI-агентов (демо).")}
              className="text-slate-300 transition hover:text-slate-500"
              aria-label="Подробнее"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {aiAvatars.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => openDevelopmentStub(`Агент «${label}»: открыть чат (демо).`)}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-gradient-to-br from-white to-slate-50 text-xs font-bold text-slate-700 shadow-softSm transition hover:brightness-[1.02] active:translate-y-[1px] dark:border-slate-600 dark:from-slate-700 dark:to-slate-800 dark:text-slate-100"
              >
                {label.slice(0, 2)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <button
        type="button"
        onClick={() => openDevelopmentStub("Этикетка контрагента: редактирование (демо).")}
        className="block w-full text-left"
      >
        <Card className="border-accent-yellow/40 bg-gradient-to-r from-amber-50/80 to-white transition hover:brightness-[1.02]">
          <CardContent className="flex items-center gap-3 py-3">
            <span className="text-lg">🏷️</span>
            <div>
              <div className="text-sm font-semibold text-slate-900">Ваша этикетка</div>
              <div className="text-xs text-slate-600">ИП Балашов Владислав</div>
            </div>
            <span className="ml-auto text-accent-yellow">✓</span>
          </CardContent>
        </Card>
      </button>

      <div>
        <div className="mb-2 flex items-center justify-between px-0.5">
          <h2 className="text-sm font-semibold text-slate-900">Поможет развивать ваш бизнес</h2>
          <button
            type="button"
            onClick={() => openDevelopmentStub("Каталог предложений для бизнеса (демо).")}
            className="text-slate-400 transition hover:text-slate-600"
            aria-label="Ещё"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setMailingOpen(true)}
            className="w-[220px] shrink-0 rounded-[22px] border border-slate-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-4 text-left shadow-softSm transition hover:brightness-[1.02] active:translate-y-[1px]"
          >
            <div className="text-3xl">📣</div>
            <div className="mt-3 text-sm font-bold text-slate-900">Таргет рассылка</div>
            <div className="mt-1 text-xs text-slate-600">Расскажем всем о вашем бизнесе</div>
          </button>
          <button
            type="button"
            onClick={() => openDevelopmentStub("Акция: скидка на пакет минут (демо).")}
            className="w-[200px] shrink-0 rounded-[22px] bg-accent-dark p-4 text-left text-white shadow-softSm transition hover:brightness-110 active:translate-y-[1px]"
          >
            <div className="text-xs font-semibold opacity-80">Акция</div>
            <div className="mt-2 text-sm font-bold">Скидка на пакет минут</div>
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between px-0.5">
          <h2 className="text-sm font-semibold text-slate-900">Советы для бизнеса</h2>
          <button
            type="button"
            onClick={() => openDevelopmentStub("Лента статей (демо).")}
            className="text-slate-400 transition hover:text-slate-600"
            aria-label="Ещё"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => router.push("/assistant/?q=Дай советы для бизнеса")}
            className="w-[260px] shrink-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white text-left shadow-softSm transition hover:bg-slate-50/80"
          >
            <div className="h-28 bg-gradient-to-br from-emerald-100 via-amber-50 to-rose-100" />
            <div className="p-3 text-xs font-semibold leading-snug text-slate-900">
              Небольшие точки продаж: как настроить процессы с помощью AI-агентов в малом бизнесе
            </div>
          </button>
          <button
            type="button"
            onClick={() => router.push("/assistant/")}
            className="w-[200px] shrink-0 rounded-[22px] border border-slate-200 bg-slate-50 p-3 text-left text-xs text-slate-600 transition hover:bg-slate-100"
          >
            Ещё статьи в ленте (демо)
          </button>
        </div>
      </div>

      <Button variant="outline" className="w-full rounded-2xl border-dashed" onClick={() => setMailingOpen(true)}>
        <Sparkles className="h-4 w-4" /> Открыть «Таргет рассылка»
      </Button>

      <TargetMailingModal
        open={mailingOpen}
        onClose={() => setMailingOpen(false)}
        onPrimaryAction={() => {
          openDevelopmentStub("Оформление заявки на таргет-рассылку.");
          setMailingOpen(false);
        }}
      />
    </div>
  );
}
