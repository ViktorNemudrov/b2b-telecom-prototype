# Досье для ручного QA

## Цель
- Сформировать ручную тест-стратегию enterprise-уровня для контроля функционального и пользовательского качества.

## Область QA
- Критичные бизнес-пути:
- assistant -> invoices,
- assistant -> appeals,
- assistant -> calls,
- auth/session/navigation stability.
- Кросс-сценарии:
- обработка резервного сценария/ошибок,
- permissions,
- localization/theme parity.

## Уровни тестирования
- Smoke: ключевые сценарии доступности.
- Sanity: проверка релизных изменений.
- Functional: full scenario validation.
- Regression: полный набор критичных/высокорисковых сценариев.
- UAT support: совместно с бизнесом.

## Подход к проектированию тестов
- Scenario-based + risk-based.
- Требование: каждый FR имеет минимум 1 positive + 1 negative сценарий.
- Для AI сценариев:
- expected behavior по intent,
- поведение резервного сценария,
- safety behavior.

## Тестовые артефакты
- Мастер-план тестирования.
- Test scenario catalog.
- Test cases with preconditions/data/postconditions.
- Defect report template.
- Regression matrix.
- UAT checklist.

## Критерии качества
- Zero blocker/critical defects на релиз.
- <= agreed threshold high defects with mitigations.
- Pass rate критичных тестов >= 98%.
- Complete traceability BR/FR -> test coverage.

## Данные и окружение
- Тестовые данные по инвойсам/обращениям/звонкам.
- Dataset для edge-case валидации (пустые, длинные, некорректные значения).
- Подготовленные роли/доступы для permission testing.

## Управление дефектами
- Severity vs Priority matrix.
- SLA на triage/analysis/fix verification.
- Root cause tagging для повторяющихся дефектов.
- Еженедельная defect trend аналитика.

## Риски ручного QA
- Скрытые регрессии в mixed assistant flows.
- Недокрытие error states.
- Несогласованность acceptance criteria между ролями.

## Шаблон для Confluence (план ручного тестирования)
### 1. Цель
- Область релиза
- Цели качества

### 2. Область
- In scope
- Out of scope

### 3. Стратегия
- Test levels
- Risk-based priorities

### 4. Кейсы и данные
- Scenario list
- Data setup

### 5. Критерии входа/выхода
- Start criteria
- Completion criteria

### 6. Дефекты и отчетность
- Defect flow
- Reporting cadence

## Пример матрицы регрессии (минимум)
- R1: Auth/session navigation.
- R2: Assistant deterministic intents.
- R3: Цепочка резервирования ассистента для живого ИИ.
- R4: Invoices list/detail/status.
- R5: Appeals list/create/filter.
- R6: Missed calls and details.
- R7: Theme parity and responsive.
- R8: PWA installability basics.
