# Досье для Бизнес-аналитика (BA)

## Цель
- Преобразовать продуктовое видение в структурированный, измеримый и проверяемый набор бизнес-требований.

## Бизнес-домен (по текущему продукту)
- Домены:
- AI ассистент и сценарные рекомендации.
- Счета/платежи/задолженности.
- Обращения (жизненный цикл тикета).
- Звонки (пропущенные, сводки, follow-up).
- Настройки, onboarding, персонализация.

## Персоны
- Owner (ИП/директор): контроль денег, рисков и операций.
- Office manager: исполнение рутинных действий по запросам.
- Finance operator: работа со счетами, неоплатами, сверками.
- Support coordinator: обращения и контроль SLA.

## JTBD (пример)
- Когда есть неоплаченные счета, я хочу быстро увидеть рисковые позиции, чтобы предотвратить блокировки сервиса.
- Когда есть пропущенные звонки, я хочу приоритизировать перезвон, чтобы не терять лиды.
- Когда я взаимодействую с ассистентом, я хочу надежный ответ или безопасный fallback, чтобы процесс не прерывался.

## Бизнес-способности
- Assisted operations (AI + deterministic сценарии).
- Account financial operations.
- Customer issue lifecycle visibility.
- Communication intelligence.
- Personalization and user preferences.

## Бизнес-требования (верхний уровень)
- BR-01: Пользователь получает actionable insight в пределах 1-2 экранов для ключевых операций.
- BR-02: Критичные операции имеют детерминированный путь без зависимости от live AI.
- BR-03: Для каждого ключевого сценария доступны метрики результата.
- BR-04: Ошибки AI не блокируют завершение бизнес-задачи.
- BR-05: Продукт поддерживает role-aware UX для B2B контекста.

## Бизнес-правила
- Для критичных финансовых действий обязательна явная user confirmation.
- Для live AI нужен policy fallback на сценарные ответы при низкой надежности.
- Любой высокорисковый ответ AI должен иметь explainability marker (source/fallback label).
- Влияющие на платежи изменения требуют audit trail.

## Карта потока ценности
- Query -> Intent -> Resolution -> Action -> Outcome metric.
- Пример:
- User asks invoice status -> intent classification -> invoice widget/list -> user pays -> payment completion KPI.

## Декомпозиция KPI
- Outcome KPI -> Leading indicators -> Operational metrics.
- Пример:
- `time-to-payment` -> `invoice widget interaction rate` + `invoice list open-to-pay conversion`.

## Backlog decomposition стандарт
- Epic:
- business objective,
- hypothesis,
- success KPI.
- Feature:
- persona,
- scenario,
- expected value.
- Story:
- AC + exception rules + data needs.

## Модель приемки
- Business acceptance:
- value delivered,
- scenario complete,
- KPI instrumentation ready.
- Operational acceptance:
- support readiness,
- training material,
- rollback clarity.

## Риски BA
- Требования "как в демо" без бизнес-обоснования.
- Смешение UX-прототипа и production policy.
- Неполная формализация исключений и ручных обходов.

## Шаблон для Confluence (страница бизнес-требования)
### 1. Контекст
- Business problem
- Stakeholders

### 2. Требование
- Description
- Priority
- Value hypothesis

### 3. Правила и ограничения
- Business rules
- Legal/compliance constraints

### 4. Приемка
- Критерии приемки
- KPI/measurement

### 5. Зависимости
- Systems
- Teams

### 6. Риски
- Risk
- Mitigation

## Первые обязательные BA артефакты
- Business Process Catalog.
- Capability map.
- BRD v1 с приоритизацией.
- KPI dictionary.
- Impact map по релизным волнам.
