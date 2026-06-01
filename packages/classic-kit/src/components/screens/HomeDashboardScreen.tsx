"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { TariffSubscriptionCard } from "@shared/components/TariffSubscriptionCard";
import { TargetMailingModal } from "@shared/components/TargetMailingModal";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { dashboardLines } from "@shared/lib/dashboardMock";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { getTariffFromFeed } from "@shared/lib/mockData";
import { resolveProductTap } from "@shared/lib/widgetTapActions";

const aiAvatars = ["AI", "GPT", "Claude", "CRM", "Отчёты"];

/** Тепловая карта звонков по часам — новый стиль по дизайну */
function CallHeatmap() {
  const cols = 14;
  const rows = 7;
  return (
    <div className="mt-3 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const intensity = Math.random();
        let bg = "bg-[rgb(var(--surface-2))]";
        if (intensity > 0.85) bg = "bg-accent-orange";
        else if (intensity > 0.65) bg = "bg-accent-orange/50";
        else if (intensity > 0.45) bg = "bg-accent-amber/40";
        else if (intensity > 0.25) bg = "bg-[rgb(var(--border))]";
        return <div key={i} className={`aspect-square rounded-[3px] ${bg}`} />;
      })}
    </div>
  );
}

export type HomeDashboardRecordingsTap = { useMock: boolean; dimmedDisabled: boolean };

export function HomeDashboardScreen({
  recordingsTap
}: {
  /** Для экрана «Виджеты»: кастомизация карточки «Запись разговоров». */
  recordingsTap?: HomeDashboardRecordingsTap;
} = {}) {
  const router = useRouter();
  const [mailingOpen, setMailingOpen] = React.useState(false);
  const tariff = getTariffFromFeed();

  const onRecordingsNavigate = () => {
    const cfg = recordingsTap ?? { useMock: false, dimmedDisabled: false };
    const r = resolveProductTap("Запись разговоров", cfg);
    if (r.kind === "none") return;
    if (r.kind === "stub") {
      openDevelopmentStub(r.message);
      return;
    }
    router.push("/communication/");
  };

  return (
    <div className="space-y-3 pb-2">
      {/* Бейдж подписки */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-orange/15 px-4 py-2 text-xs font-semibold text-accent-orange dark:bg-accent-orange/20">
          <span>✓</span> Подписка активна
        </span>
      </div>

      {tariff ? <TariffSubscriptionCard stats={tariff} /> : null}

      {/* Мои номера */}
      <Card>
        <CardContent className="pb-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[rgb(var(--text))]">Мои номера</h2>
            <button
              type="button"
              onClick={() => openDevelopmentStub("Управление номерами (демо).")}
              className="text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))]"
              aria-label="Ещё"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 divide-y divide-[rgb(var(--border))]">
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
                    <div className="text-sm font-semibold text-[rgb(var(--text))]">{line.phone}</div>
                    <div className="text-xs text-[rgb(var(--muted))]">{line.name}</div>
                    <div className="mt-2 flex gap-2">
                      <div className="min-w-0 flex-1 rounded-xl bg-[rgb(var(--surface-2))] px-2 py-1.5">
                        <div className="text-[10px] font-semibold text-[rgb(var(--muted))]">{line.gb} гб</div>
                        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                          <div className="h-full bg-accent-orange" style={{ width: `${gbPct * 100}%` }} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 rounded-xl bg-[rgb(var(--surface-2))] px-2 py-1.5">
                        <div className="text-[10px] font-semibold text-[rgb(var(--muted))]">{line.min} мин</div>
                        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                          <div className="h-full bg-accent-amber" style={{ width: `${minPct * 100}%` }} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 rounded-xl bg-[rgb(var(--surface-2))] px-2 py-1.5">
                        <div className="text-[10px] font-semibold text-[rgb(var(--muted))]">{line.sms} смс</div>
                        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                          <div className="h-full bg-rose-500" style={{ width: `${smsPct * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[rgb(var(--border))]" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Записи разговоров */}
      <Card
        data-testid="widgets-recordings-card"
        className={
          recordingsTap?.dimmedDisabled
            ? "pointer-events-none opacity-35 saturate-0"
            : undefined
        }
      >
        <CardContent className="pb-4 pt-4">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={onRecordingsNavigate}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-[rgb(var(--text))]">Записи разговоров</h2>
                  <span className="text-xs font-medium text-[rgb(var(--muted))]">24.05</span>
                  <span className="h-2 w-2 rounded-full bg-accent-orange" />
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <span>
                    <span className="font-semibold text-[rgb(var(--text))]">245</span>{" "}
                    <span className="text-[rgb(var(--muted))]">принято</span>
                  </span>
                  <span>
                    <span className="font-semibold text-accent-amber">12</span>{" "}
                    <span className="text-[rgb(var(--muted))]">ждут ответа</span>
                  </span>
                  <span>
                    <span className="font-semibold text-rose-500">16</span>{" "}
                    <span className="text-[rgb(var(--muted))]">секретарь</span>
                  </span>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={onRecordingsNavigate}
              className="shrink-0 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--text))] transition hover:brightness-105"
            >
              Все
            </button>
          </div>
          <button type="button" className="mt-1 w-full text-left" onClick={onRecordingsNavigate}>
            <CallHeatmap />
          </button>
          <div className="mt-2 flex justify-between px-0.5 text-[10px] font-medium text-[rgb(var(--muted))]">
            {["8", "10", "12", "14", "16", "18"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI — команда */}
      <Card>
        <CardContent className="pb-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[rgb(var(--text))]">AI — команда</h2>
              <p className="text-xs text-[rgb(var(--muted))]">Ваши помощники 24/7</p>
            </div>
            <button
              type="button"
              onClick={() => openDevelopmentStub("Каталог AI-агентов (демо).")}
              className="text-[rgb(var(--border))] transition hover:text-[rgb(var(--muted))]"
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
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] text-xs font-bold text-[rgb(var(--text))] shadow-softSm transition hover:brightness-105 active:scale-[0.97]"
              >
                {label.slice(0, 2)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Этикетка */}
      <button
        type="button"
        onClick={() => openDevelopmentStub("Этикетка контрагента: редактирование (демо).")}
        className="block w-full text-left"
      >
        <Card className="border-accent-orange/30 bg-gradient-to-r from-accent-orange/10 to-transparent dark:from-accent-orange/15 dark:to-transparent">
          <CardContent className="flex items-center gap-3 py-3">
            <span className="text-lg">🏷️</span>
            <div>
              <div className="text-sm font-semibold text-[rgb(var(--text))]">Ваша этикетка</div>
              <div className="text-xs text-[rgb(var(--muted))]">ИП Балашов Владислав</div>
            </div>
            <span className="ml-auto text-accent-orange">✓</span>
          </CardContent>
        </Card>
      </button>

      {/* Поможет развивать ваш бизнес */}
      <div>
        <div className="mb-2 flex items-center justify-between px-0.5">
          <h2 className="text-sm font-semibold text-[rgb(var(--text))]">Поможет развивать ваш бизнес</h2>
          <button
            type="button"
            onClick={() => openDevelopmentStub("Каталог предложений для бизнеса (демо).")}
            className="text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))]"
            aria-label="Ещё"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setMailingOpen(true)}
            className="w-[220px] shrink-0 snap-start rounded-3xl border border-[rgb(var(--border))] bg-gradient-to-br from-accent-orange/15 to-accent-amber/10 p-4 text-left shadow-softSm transition hover:brightness-105 active:scale-[0.98] dark:from-accent-orange/20 dark:to-accent-amber/15"
          >
            <div className="text-3xl">📣</div>
            <div className="mt-3 text-sm font-bold text-[rgb(var(--text))]">Таргет рассылка</div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">Расскажем всем о вашем бизнесе</div>
          </button>
          <button
            type="button"
            onClick={() => openDevelopmentStub("Акция: скидка на пакет минут (демо).")}
            className="w-[200px] shrink-0 snap-start rounded-3xl bg-accent-dark p-4 text-left text-white shadow-softSm transition hover:brightness-110 active:scale-[0.98] dark:bg-accent-dark"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
              <TrendingUp className="h-3.5 w-3.5" />
              Акция
            </div>
            <div className="mt-2 text-sm font-bold">Скидка на пакет минут</div>
          </button>
        </div>
      </div>

      {/* Советы для бизнеса */}
      <div>
        <div className="mb-2 flex items-center justify-between px-0.5">
          <h2 className="text-sm font-semibold text-[rgb(var(--text))]">Советы для бизнеса</h2>
          <button
            type="button"
            onClick={() => openDevelopmentStub("Лента статей (демо).")}
            className="text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))]"
            aria-label="Ещё"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => router.push("/assistant/?q=Дай советы для бизнеса")}
            className="w-[260px] shrink-0 snap-start overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-left shadow-softSm transition hover:brightness-105 active:scale-[0.98]"
          >
            <div className="h-28 bg-gradient-to-br from-accent-orange/30 via-accent-amber/20 to-rose-500/20" />
            <div className="p-3 text-xs font-semibold leading-snug text-[rgb(var(--text))]">
              Небольшие точки продаж: как настроить процессы с помощью AI-агентов в малом бизнесе
            </div>
          </button>
          <button
            type="button"
            onClick={() => router.push("/assistant/")}
            className="w-[200px] shrink-0 snap-start rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] p-3 text-left text-xs text-[rgb(var(--muted))] transition hover:brightness-105 active:scale-[0.98]"
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
