"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@shared/components/ui/card";
import { goSmartBack } from "@shared/lib/smartBack";

const versions = [
  {
    tag: "v.0.2.4",
    items: [
      "Добавлен полноценный раздел «Уведомления» с единым списком действий: неоплаченные счета, пропущенные звонки, еженедельная сводка и обращения",
      "Проведена стабилизация навигации: восстановлены переходы к счетам и пропущенным, сохранены сценарии работы через чат ассистента",
      "Усилена логика ассистента по доменам (звонки/счета/обращения) с приоритетной маршрутизацией интентов",
      "Обновлена история версий: подробный формат, новая сортировка и единый стандарт нумерации",
      "Исправлены неточности работы продукта"
    ]
  },
  {
    tag: "v.0.2.3",
    items: [
      "Расширена аналитика в чате: сравнение месяцев, доля неоплаты, динамика, топ-счета, ответы по «максимальным тратам»",
      "Добавлены понятные русские статусы счетов в чат-виджетах: «Оплачен», «Не оплачен», «В оплате»",
      "Добавлено логирование интентов и выгрузка журналов диалога для тестирования качества ответов",
      "Улучшен fallback ассистента при недоступности live-ИИ ответа",
      "Исправлены неточности работы продукта"
    ]
  },
  {
    tag: "v.0.2.2",
    items: [
      "Полностью переработан сценарий оплаты: QR-камера, отдельное подокно для карты, обновленные кнопки банков",
      "Добавлена озвучка ключевых блоков аналитики и звонков",
      "Сформированы расширенные моки счетов по месяцам (январь, февраль, март, апрель) с рабочими карточками",
      "Подготовлены дополнительные аудиозаписи звонков для демонстрации",
      "Исправлены неточности работы продукта"
    ]
  },
  {
    tag: "v.0.2.1",
    items: [
      "Реализован переход к чат-центричной модели: часть действий теперь доступна как через разделы, так и через диалог с ассистентом",
      "Добавлены intent-реестр и автогенерация перечня возможностей ассистента",
      "Подключен live-режим ответов с контекстом данных и безопасным fallback на моки",
      "Выполнены улучшения UX карточек и переходов в фиде",
      "Исправлены неточности работы продукта"
    ]
  },
  {
    tag: "v.0.1.0",
    items: [
      "Запущен AI-ассистент с базовыми сценариями по счетам, звонкам и обращениям",
      "Подготовлены первые аналитические виджеты и ответы на частые запросы",
      "Добавлена базовая поддержка dark theme в ключевых экранах",
      "Исправлены неточности работы продукта"
    ]
  },
  {
    tag: "v.0.0.1",
    items: [
      "Собран стартовый мобильный прототип личного кабинета B2B",
      "Реализованы основные разделы: Главная, Коммуникации, Счета, Обращения, Профиль",
      "Подготовлены демонстрационные данные и базовые пользовательские сценарии",
      "Исправлены неточности работы продукта"
    ]
  }
];

export function FaqVersionsScreen({ backHref = "/settings/" }: { backHref?: string }) {
  const router = useRouter();
  return (
    <div className="safe-px mx-auto max-w-[760px] space-y-4 pb-8 pt-2">
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        onClick={() => goSmartBack(router, backHref)}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
          <ChevronLeft className="h-4 w-4" />
        </span>
        Назад
      </button>

      <Card>
        <CardContent className="space-y-2 pb-4 pt-4">
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">FAQ и история версий</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Здесь собраны основные изменения по версиям продукта.
          </p>
        </CardContent>
      </Card>

      {versions.map((version) => (
        <Card key={version.tag}>
          <CardContent className="space-y-2 pb-4 pt-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{version.tag}</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {version.items.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      <Card className="opacity-85">
        <CardContent className="space-y-1 pb-4 pt-4 text-xs text-slate-500 dark:text-slate-400">
          <p>Дизайнер: Балашов Влад</p>
          <p>Создатель: Немудров Виктор</p>
          <p>Владелец продукта: Пальчиков Леонид</p>
          <p>
            Если нужен полный changelog, можно выгрузить журнал сессии через команду разработки.
          </p>
          <Link href="/assistant/" className="inline-flex pt-1 text-sm font-semibold text-accent-dark dark:text-accent-yellow">
            Перейти к ассистенту
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
