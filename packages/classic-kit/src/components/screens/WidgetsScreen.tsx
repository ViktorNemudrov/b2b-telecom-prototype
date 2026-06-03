"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Globe, Sparkles, Tag } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";
import { resolveProductTap } from "@shared/lib/widgetTapActions";

const topPages = ["/contracts", "/main", "/services"] as const;

function ArrowRow({
  title,
  subtitle,
  onClick
}: {
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl px-0.5 py-0.5 text-left transition hover:bg-[rgb(var(--surface2))]"
    >
      <div>
        <div className="text-[19px] font-medium leading-tight text-[rgb(var(--text))]">{title}</div>
        {subtitle ? <div className="text-[12px] text-[rgb(var(--muted))]">{subtitle}</div> : null}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[rgb(var(--muted))]/50" />
    </button>
  );
}

function CompactHeatmap() {
  const cols = 16;
  const rows = 6;
  return (
    <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: cols * rows }).map((_, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const distance = Math.abs(col - 5) + Math.abs(row - 3);
        const color =
          distance <= 2
            ? "bg-slate-800"
            : distance <= 3
              ? "bg-slate-500"
              : distance <= 4
                ? "bg-amber-400"
                : "bg-slate-200";
        return <span key={idx} className={cn("aspect-square rounded-full", color)} />;
      })}
    </div>
  );
}

/**
 * Экран «Виджеты» приведен к актуальному макету `Рисунок1.png`.
 * Существующие переходы сохранены, остальное работает через заглушки.
 */
export function WidgetsScreen() {
  const router = useRouter();
  const addCustom = useUiCustomization("classic.widgets.addProduct");
  const assistantCustom = useUiCustomization("classic.widgets.assistant");
  const recordingsCustom = useUiCustomization("classic.widgets.recordings");

  const onRecordingsTap = () => {
    const result = resolveProductTap("Запись разговоров", {
      useMock: recordingsCustom.useMock,
      dimmedDisabled: recordingsCustom.dimmedDisabled
    });
    if (result.kind === "none") return;
    if (result.kind === "stub") {
      openDevelopmentStub(result.message);
      return;
    }
    router.push("/communication/");
  };

  return (
    <div className="space-y-2.5">
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface2))] px-3 py-1 text-[10px] font-semibold text-[rgb(var(--text))] shadow-softSm">
          Подписка <span className="text-accent-orange">✓</span>
        </span>
      </div>

      <div className="text-center leading-tight">
        <div className="text-[35px] font-medium tracking-[-0.02em] text-[rgb(var(--text))]">Связь для бизнеса</div>
        <div className="text-[12px] text-[rgb(var(--muted))]">ИП Балашов Владислав</div>
      </div>

      <Card>
        <CardContent className="pt-2.5">
          <ArrowRow title="Мобильная связь" onClick={() => openDevelopmentStub("Мобильная связь в разработке.")} />
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            <div className="col-span-2 rounded-[16px] bg-[rgb(var(--surface2))] p-2.5">
              <div className="text-[24px] font-medium leading-none text-[rgb(var(--text))]">3 435 гб</div>
              <div className="mt-2.5 grid grid-cols-8 gap-1">
                {Array.from({ length: 40 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full opacity-95",
                      idx % 7 === 0 || idx % 8 === 0 ? "bg-[rgb(var(--muted))]/40" : "bg-accent-orange"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="rounded-[16px] bg-[rgb(var(--surface2))] p-2.5 text-[rgb(var(--text))]">
                <div className="text-[24px] font-medium leading-none">1 545 мин</div>
              </div>
              <div className="rounded-[16px] bg-[rgb(var(--surface2))] p-2.5 text-[rgb(var(--text))]">
                <div className="text-[24px] font-medium leading-none">800 sms</div>
              </div>
            </div>
          </div>
          <div className="mt-1.5">
            <ArrowRow
              title="Подключенные номера"
              onClick={() => openDevelopmentStub("Подключенные номера в разработке.")}
            />
          </div>
        </CardContent>
      </Card>

      <Card
        data-testid="widgets-recordings-card"
        className={recordingsCustom.dimmedDisabled ? "pointer-events-none opacity-35 saturate-0" : undefined}
      >
        <CardContent className="pt-2.5">
          <ArrowRow title="Записи разговоров — 24.05" onClick={onRecordingsTap} />
          <button type="button" className="mt-0.5 block w-full text-left" onClick={onRecordingsTap}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[39px] font-light leading-none text-[rgb(var(--text))]">245</div>
                <div className="text-[11px] text-[rgb(var(--muted))]">принято</div>
              </div>
              <div>
                <div className="text-[39px] font-light leading-none text-[rgb(var(--text))]">12</div>
                <div className="text-[11px] text-[rgb(var(--muted))]">ждут ответа</div>
              </div>
              <div>
                <div className="text-[39px] font-light leading-none text-[rgb(var(--text))]">16</div>
                <div className="text-[11px] text-[rgb(var(--muted))]">секретарь</div>
              </div>
            </div>
            <CompactHeatmap />
            <div className="mt-1.5 flex justify-between px-1 text-[10px] text-[rgb(var(--muted))]/60">
              {["8", "10", "12", "14", "16", "18"].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-2.5">
          <ArrowRow
            title="AI - команда"
            subtitle="Ваши помощники 24/7"
            onClick={() => openDevelopmentStub("AI - команда в разработке.")}
          />
          <div className="mt-1.5 flex gap-1.5">
            {["🎙", "📈", "🛠", "🧩", "🚀"].map((icon, i) => (
              <button
                key={icon + i}
                type="button"
                onClick={() => openDevelopmentStub("AI - команда в разработке.")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--surface2))] text-sm transition hover:brightness-110"
              >
                {icon}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-2.5">
          <ArrowRow title="Ваша этикетка" subtitle="ИП Балашов Владислав" onClick={() => openDevelopmentStub("Этикетка в разработке.")} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-2.5">
          <ArrowRow title="Прием платежей" subtitle="Формируйте платежи на оплату" onClick={() => openDevelopmentStub("Прием платежей в разработке.")} />
          <div className="mt-1.5 flex items-center justify-between text-[20px] font-medium text-[rgb(var(--text))]">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--surface2))] text-[rgb(var(--muted))]">
                <Tag className="h-3 w-3" aria-hidden />
              </span>
              12
              <span className="text-[11px] font-normal text-[rgb(var(--muted))]">ожидают</span>
            </span>
            <span>662 454 ₽</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-2.5">
          <ArrowRow title="Продвижение" subtitle="Продвигайте компанию и ресурсы" onClick={() => openDevelopmentStub("Продвижение в разработке.")} />
          <div className="mt-1.5 rounded-[16px] bg-[rgb(var(--surface2))] px-3 py-2">
            <div className="flex items-center justify-between text-[18px] font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--card))] text-[rgb(var(--muted))] shadow-softSm">
                  <Tag className="h-3 w-3" aria-hidden />
                </span>
                Весенние скидки
              </span>
              <span>24%</span>
            </div>
            <div className="text-[11px] text-[rgb(var(--muted))]">Топ рассылка</div>
            <div className="mt-1.5 grid grid-cols-3 gap-2 text-center text-[11px] text-[rgb(var(--muted))]">
              <div>
                <div className="text-[18px] font-medium text-[rgb(var(--text))]">12,3к</div>
                <div>рассылок</div>
              </div>
              <div>
                <div className="text-[18px] font-medium text-[rgb(var(--text))]">42%</div>
                <div>доставлено</div>
              </div>
              <div>
                <div className="text-[18px] font-medium text-[rgb(var(--text))]">3,5%</div>
                <div>переходов</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-2.5">
          <ArrowRow title="Конструктор сайтов" subtitle="Продвигайте компанию и ресурсы" onClick={() => openDevelopmentStub("Конструктор сайтов в разработке.")} />
          <div className="mt-1.5 rounded-[16px] bg-[rgb(var(--surface2))] px-3 py-2">
            <div className="text-[11px] text-[rgb(var(--muted))]">Сайт опубликован</div>
            <div className="inline-flex items-center gap-1.5 text-[21px] font-medium text-indigo-600">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--card))] text-[rgb(var(--muted))] shadow-softSm">
                <Globe className="h-3 w-3" aria-hidden />
              </span>
              beelineone.ru
            </div>
            <div className="mt-1.5 grid grid-cols-3 gap-2 text-center text-[11px] text-[rgb(var(--muted))]">
              <div>
                <div className="text-[18px] font-medium text-[rgb(var(--text))]">5,3к</div>
                <div>просмотров</div>
              </div>
              <div>
                <div className="text-[18px] font-medium text-[rgb(var(--text))]">18</div>
                <div>заявок</div>
              </div>
              <div>
                <div className="text-[18px] font-medium text-[rgb(var(--text))]">3,5%</div>
                <div>конверсия</div>
              </div>
            </div>
          </div>
          <div className="mt-1.5 text-[10px] uppercase tracking-wide text-[rgb(var(--muted))]">Топ страницы:</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {topPages.map((path) => (
              <button
                key={path}
                type="button"
                onClick={() => openDevelopmentStub(`Переход на ${path} в разработке.`)}
                className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-slate-700 dark:text-indigo-300"
              >
                {path}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-2 pt-1">
        <Button
          type="button"
          data-testid="widgets-add-product"
          variant="outline"
          className={cn(
            "rounded-full border-[rgb(var(--border))] bg-[rgb(var(--card))] text-sm font-semibold dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--card))]",
            getCustomizationButtonClasses(addCustom.dimmedDisabled)
          )}
          onClick={() => {
            if (addCustom.dimmedDisabled) return;
            openDevelopmentStub(
              addCustom.useMock
                ? "Добавление нового продукта (мок из кастомизации)."
                : "Добавление нового продукта в разработке."
            );
          }}
        >
          <span className="mr-1.5 text-base leading-none">+</span>
          Добавить новый продукт
        </Button>
        <Button
          type="button"
          data-testid="widgets-assistant"
          className={cn(
            "rounded-full bg-accent-dark text-sm font-semibold text-white shadow-softSm",
            getCustomizationButtonClasses(assistantCustom.dimmedDisabled)
          )}
          onClick={() => {
            if (assistantCustom.dimmedDisabled) return;
            if (assistantCustom.useMock) {
              openDevelopmentStub("Помощник (мок из кастомизации).");
              return;
            }
            router.push("/assistant/?openChat=1");
          }}
        >
          <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
          Помощник
        </Button>
      </div>
    </div>
  );
}
