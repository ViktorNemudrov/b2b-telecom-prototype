"use client";

import * as React from "react";

export type CustomizableElementId =
  | "ai.profile"
  | "ai.switch.assistant"
  | "ai.switch.events"
  | "ai.notifications"
  | "classic.profile"
  | "classic.search"
  | "classic.notifications"
  | "classic.switch.assistant"
  | "classic.switch.events"
  | "classic.switch.widgets"
  | "assistant.home.missed"
  | "assistant.home.appeals"
  | "assistant.home.invoices"
  | "assistant.home.unpaid"
  | "feed.settings"
  | "feed.search"
  | "feed.team"
  | "feed.missed"
  | "feed.incoming"
  | "feed.reports"
  | "feed.secretary.setup"
  | "feed.cta.alert"
  | "feed.cta.summary"
  | "feed.cta.tool"
  | "calldetail.settings"
  | "calldetail.transcript"
  | "calldetail.storage"
  | "invoice.pay"
  | "invoice.download"
  | "invoice.pay.qr"
  | "invoice.pay.card"
  | "invoice.pay.requisites"
  | "classic.widgets.addProduct"
  | "classic.widgets.assistant"
  | "classic.widgets.recordings"
  | "classic.widgets.bottom.home"
  | "classic.widgets.bottom.services"
  | "classic.widgets.bottom.documents"
  | "classic.widgets.bottom.sphere"
  | "classic.widgets.bottom.support";

export type ElementCustomization = {
  useMock: boolean;
  dimmedDisabled: boolean;
};

export type AppCustomizationVariant = "ai" | "classic";

export type CustomizableElementMeta = {
  id: CustomizableElementId;
  label: string;
  app: AppCustomizationVariant;
  description: string;
};

export const customizableElements: CustomizableElementMeta[] = [
  {
    id: "ai.profile",
    label: "AI шапка: Профиль",
    app: "ai",
    description: "Кнопка слева в верхней шапке AI-версии. В обычном режиме открывает профиль."
  },
  {
    id: "ai.switch.assistant",
    label: "AI шапка: Переключатель Ассистент (лупа + шар)",
    app: "ai",
    description: "Центральный сегмент шапки AI-версии. Переключает на вкладку ассистента."
  },
  {
    id: "ai.switch.events",
    label: "AI шапка: Переключатель Лента",
    app: "ai",
    description: "Второй сегмент в центральном переключателе AI-версии. Открывает ленту."
  },
  {
    id: "ai.notifications",
    label: "AI шапка: Уведомления",
    app: "ai",
    description: "Колокольчик справа в шапке AI-версии. Переходит в раздел уведомлений."
  },
  {
    id: "assistant.home.missed",
    label: "Главная ассистента: Чип Пропущенные звонки",
    app: "ai",
    description: "Быстрый чип под заголовком. Открывает список пропущенных звонков."
  },
  {
    id: "assistant.home.appeals",
    label: "Главная ассистента: Чип Обращения",
    app: "ai",
    description: "Быстрый чип под заголовком. Переходит в обращения."
  },
  {
    id: "assistant.home.invoices",
    label: "Главная ассистента: Чип Мои счета",
    app: "ai",
    description: "Быстрый чип под заголовком. Переходит к списку счетов."
  },
  {
    id: "assistant.home.unpaid",
    label: "Главная ассистента: Чип Счета на оплату",
    app: "ai",
    description: "Быстрый чип под заголовком. Открывает раздел счетов с фокусом на оплату."
  },
  {
    id: "feed.settings",
    label: "Лента: кнопка Настройки",
    app: "ai",
    description: "Иконка шестеренки в заголовке ленты «Коммуникация»."
  },
  {
    id: "feed.search",
    label: "Лента: кнопка Поиск",
    app: "ai",
    description: "Кнопка с иконкой поиска в панели фильтров ленты."
  },
  {
    id: "feed.team",
    label: "Лента: фильтр Команда",
    app: "ai",
    description: "Фильтр в блоке ленты, переключает выборку на сценарий «Команда»."
  },
  {
    id: "feed.missed",
    label: "Лента: фильтр Пропущенные",
    app: "ai",
    description: "Фильтр в блоке ленты, открывает сценарий пропущенных."
  },
  {
    id: "feed.incoming",
    label: "Лента: фильтр Входящие",
    app: "ai",
    description: "Фильтр в блоке ленты, показывает входящие."
  },
  {
    id: "feed.reports",
    label: "Лента: фильтр Отчеты",
    app: "ai",
    description: "Фильтр в блоке ленты, переключает на отчетные карточки."
  },
  {
    id: "feed.secretary.setup",
    label: "Лента: CTA Настроить сценарии (Секретарь)",
    app: "ai",
    description: "Кнопка в карточке «Секретарь» внутри ленты."
  },
  {
    id: "feed.cta.alert",
    label: "Лента: CTA в карточке предупреждения",
    app: "ai",
    description: "Кнопка действия в карточке alert (например, низкий баланс)."
  },
  {
    id: "feed.cta.summary",
    label: "Лента: CTA в карточке сводки",
    app: "ai",
    description: "Кнопка действия в карточке summary (например, открыть сводку)."
  },
  {
    id: "feed.cta.tool",
    label: "Лента: CTA в карточке AI-инструмента",
    app: "ai",
    description: "Кнопка действия в карточке tool (например, сгенерировать отчет)."
  },
  {
    id: "calldetail.settings",
    label: "Детали звонка: кнопка Настройки",
    app: "ai",
    description: "Кнопка настройки в верхней части экрана детали звонка."
  },
  {
    id: "calldetail.transcript",
    label: "Детали звонка: CTA Расшифровка",
    app: "ai",
    description: "Кнопка в блоке итогов звонка для показа расшифровки."
  },
  {
    id: "calldetail.storage",
    label: "Детали звонка: CTA Увеличить срок хранения",
    app: "ai",
    description: "Кнопка в нижней карточке на экране детали звонка."
  },
  {
    id: "invoice.pay",
    label: "Детали счета: CTA Оплатить",
    app: "ai",
    description: "Основная кнопка оплаты на экране детали счета."
  },
  {
    id: "invoice.download",
    label: "Детали счета: CTA Скачать PDF",
    app: "ai",
    description: "Кнопка скачивания PDF счета на экране детали счета."
  },
  {
    id: "invoice.pay.qr",
    label: "Оплата: CTA QR-код",
    app: "ai",
    description: "Кнопка запуска оплаты по QR внутри модалки оплаты."
  },
  {
    id: "invoice.pay.card",
    label: "Оплата: CTA Оплата банковской картой",
    app: "ai",
    description: "Кнопка перехода к форме оплаты картой в модалке оплаты."
  },
  {
    id: "invoice.pay.requisites",
    label: "Оплата: CTA Оплата по реквизитам",
    app: "ai",
    description: "Кнопка оплаты по реквизитам в модалке оплаты."
  },
  {
    id: "classic.profile",
    label: "Classic шапка: Профиль",
    app: "classic",
    description: "Левая кнопка профиля в верхней шапке Classic-версии (настройки)."
  },
  {
    id: "classic.switch.events",
    label: "Classic навбар: иконка Фид",
    app: "classic",
    description: "Иконка фида (полоски) в навбаре. Открывает ленту событий."
  },
  {
    id: "classic.switch.widgets",
    label: "Classic навбар: иконка Виджеты",
    app: "classic",
    description: "Иконка виджетов (сетка) в навбаре. Открывает экран виджетов."
  },
  {
    id: "classic.switch.assistant",
    label: "Classic навбар: Главный экран (лупа + шар)",
    app: "classic",
    description: "Центральный сегмент навбара. Ведёт на главный экран ассистента."
  },
  {
    id: "classic.search",
    label: "Classic шапка: Поиск",
    app: "classic",
    description:
      "Управляет полем/кнопкой поиска в верхней шапке (`GlobalAppHeader`). В обычном режиме открывает демо-сценарий глобального поиска по разделам; режим «мок» подставляет заглушку вместо реального запроса."
  },
  {
    id: "classic.notifications",
    label: "Classic шапка: Уведомления",
    app: "classic",
    description: "Колокольчик справа в верхней шапке Classic-версии, ведёт в уведомления."
  },
  {
    id: "classic.widgets.addProduct",
    label: "Виджеты: кнопка «Добавить новый продукт»",
    app: "classic",
    description: "Кнопка над сеткой продуктов. В обычном режиме открывает демо-действие."
  },
  {
    id: "classic.widgets.assistant",
    label: "Виджеты: кнопка «Помощник»",
    app: "classic",
    description: "Кнопка над сеткой продуктов. В обычном режиме открывает демо-действие."
  },
  {
    id: "classic.widgets.recordings",
    label: "Виджеты: карточка «Запись разговоров»",
    app: "classic",
    description: "Карточка продукта. В обычном режиме открывает экран записей разговоров."
  },
  {
    id: "classic.widgets.bottom.home",
    label: "Виджеты: нижнее меню «Главная»",
    app: "classic",
    description: "Первый пункт нижней панели на экранах с виджетами. Ведёт на экран виджетов."
  },
  {
    id: "classic.widgets.bottom.services",
    label: "Виджеты: нижнее меню «Сервисы»",
    app: "classic",
    description: "Второй пункт нижней панели. В обычном режиме открывает демо-действие."
  },
  {
    id: "classic.widgets.bottom.documents",
    label: "Виджеты: нижнее меню «Документы»",
    app: "classic",
    description: "Третий пункт нижней панели. Ведёт в раздел документов."
  },
  {
    id: "classic.widgets.bottom.sphere",
    label: "Виджеты: нижнее меню «Сфера»",
    app: "classic",
    description: "Четвёртый пункт нижней панели. В обычном режиме открывает демо-действие."
  },
  {
    id: "classic.widgets.bottom.support",
    label: "Виджеты: нижнее меню «Поддержка»",
    app: "classic",
    description: "Пятый пункт нижней панели. Ведёт в раздел поддержки."
  }
];

type Store = Record<CustomizableElementId, ElementCustomization>;

function buildDefaultStore(): Store {
  return customizableElements.reduce(
    (acc, item) => {
      acc[item.id] = { useMock: false, dimmedDisabled: false };
      return acc;
    },
    {} as Store
  );
}

const DEFAULT_STORE = buildDefaultStore();

function sanitizeStore(value: unknown): Store {
  const base = buildDefaultStore();
  if (!value || typeof value !== "object") return base;
  const raw = value as Record<string, unknown>;
  for (const item of customizableElements) {
    const maybe = raw[item.id];
    if (!maybe || typeof maybe !== "object") continue;
    const entry = maybe as Record<string, unknown>;
    base[item.id] = {
      useMock: Boolean(entry.useMock),
      dimmedDisabled: Boolean(entry.dimmedDisabled)
    };
  }
  return base;
}

type UiCustomizationContextShape = {
  store: Store;
  setUseMock: (id: CustomizableElementId, value: boolean) => void;
  setDimmedDisabled: (id: CustomizableElementId, value: boolean) => void;
};

const UiCustomizationContext = React.createContext<UiCustomizationContextShape>({
  store: DEFAULT_STORE,
  setUseMock: () => {},
  setDimmedDisabled: () => {}
});

export function UiCustomizationProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = React.useState<Store>(DEFAULT_STORE);

  const setUseMock = React.useCallback((id: CustomizableElementId, value: boolean) => {
    setStore((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        useMock: value,
        // Modes are mutually exclusive: when mock is enabled,
        // the dimmed-disabled mode must be turned off.
        dimmedDisabled: value ? false : prev[id].dimmedDisabled
      }
    }));
  }, []);

  const setDimmedDisabled = React.useCallback((id: CustomizableElementId, value: boolean) => {
    setStore((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        dimmedDisabled: value,
        // Modes are mutually exclusive: when dimmed-disabled is enabled,
        // the mock mode must be turned off.
        useMock: value ? false : prev[id].useMock
      }
    }));
  }, []);

  return React.createElement(
    UiCustomizationContext.Provider,
    { value: { store, setUseMock, setDimmedDisabled } },
    children
  );
}

export function useUiCustomization(elementId: CustomizableElementId) {
  const { store, setUseMock, setDimmedDisabled } = React.useContext(UiCustomizationContext);
  const current = store[elementId] ?? { useMock: false, dimmedDisabled: false };
  return {
    useMock: current.useMock,
    dimmedDisabled: current.dimmedDisabled,
    setUseMock: (value: boolean) => setUseMock(elementId, value),
    setDimmedDisabled: (value: boolean) => setDimmedDisabled(elementId, value)
  };
}

export function getCustomizationButtonClasses(dimmedDisabled: boolean) {
  return dimmedDisabled
    ? "pointer-events-none opacity-35 saturate-0"
    : "opacity-100";
}

export function __unsafe_test__sanitizeStore(value: unknown): Store {
  return sanitizeStore(value);
}
