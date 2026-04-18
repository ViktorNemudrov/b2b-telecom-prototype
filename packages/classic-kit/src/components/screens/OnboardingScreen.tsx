"use client";

import { PageBackLink } from "@shared/components/PageBackLink";
import { Card, CardContent } from "@shared/components/ui/card";

const onboardingSections = [
  {
    title: "Про карточки - тут самое важное",
    text:
      "Карточки держат фокус на приоритетах дня: пропущенные звонки, итоги, точки риска и быстрый старт действий. " +
      "Один экран - и сразу понятно, что важно сделать прямо сейчас."
  },
  {
    title: "Про chips - тут популярные сценарии",
    text:
      "Chips работают как умные шорткаты: короткий тап запускает готовый сценарий без лишних шагов. " +
      "Счета, звонки, рассылки, инсайты и обращения доступны моментально."
  },
  {
    title: "Про чат - тут вы можете спрашивать по продуктам",
    text:
      "Чат понимает бизнес-контекст и переводит запрос в действие: показать продукты, найти счета, проверить платежи, открыть обращения. " +
      "Если нужный сценарий еще дорабатывается, вы сразу видите это в понятном ответе."
  },
  {
    title: "Лента - тут рекомендации, инсайты, аналитика",
    text:
      "Лента собирает рекомендации, инсайты и аналитику в одном потоке, чтобы решения принимались быстрее. " +
      "Никакого шума - только сигналы, которые реально влияют на результат."
  }
];

export function OnboardingScreen({ backHref = "/settings/" }: { backHref?: string }) {
  return (
    <div className="safe-px mx-auto max-w-[760px] space-y-4 pb-8 pt-2">
      <PageBackLink href={backHref} />

      <Card>
        <CardContent className="space-y-2 pb-4 pt-4">
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">Онбординг</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Короткий гид по ключевым сценариям: ясно, быстро и в едином стиле.
          </p>
        </CardContent>
      </Card>

      {onboardingSections.map((section) => (
        <Card key={section.title}>
          <CardContent className="space-y-2 pb-4 pt-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{section.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
