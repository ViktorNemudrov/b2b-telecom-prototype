# Сквозная трассировка и гейты качества

## Цель
- Обеспечить управляемость enterprise-программы через сквозную трассировку требований и единые release gates.

## Структура RTM (матрицы трассировки требований)
- Поля:
- `Business Goal ID`
- `BR ID`
- `FR ID`
- `NFR ID`
- `Design Artifact`
- `API Contract`
- `FE/BE Task IDs`
- `Manual Test IDs`
- `Automation Test IDs`
- `Monitoring KPI/Event`
- `Версия релиза`
- `Owner`

## Пример RTM записи
- BG-01 -> BR-03 -> FR-02/FR-03 -> NFR-LAT-01
- Design: `Assistant chat flow v1`
- API: `POST /assistant/query`
- FE: `FE-ASST-14`
- BE: `BE-ORCH-07`
- QA-M: `M-CHAT-041`
- QA-A: `A-E2E-CHAT-12`
- Observability: `assistant_query_success_rate`

## Гейты качества (по стадиям)
- Гейт A: discovery завершен
- утверждены BR/FR/NFR,
- архитектурные решения зафиксированы,
- risk register создан.
- Гейт B: сборка готова
- API contracts frozen v1,
- test strategy утверждена,
- environments готовы.
- Гейт C: кандидат в релиз
- critical regression pass,
- security/performance baseline pass,
- observability dashboards готовы.
- Гейт D: go-live
- UAT sign-off,
- runbooks + support model готовы,
- rollback procedure проверен.
- Гейт E: выход из hypercare
- стабильность SLO,
- снижение incident rate,
- закрыт open high-risk list.

## Чеклист готовности к релизу
- Functional:
- AC выполнены.
- Scope freeze соблюден.
- Regression:
- manual + auto pass targets выполнены.
- Security:
- no unresolved critical vulnerabilities.
- Performance:
- SLO baseline met.
- Operations:
- alerting/on-call/runbook ready.
- Product:
- KPI instrumentation verified.

## Политика порогов по дефектам (пример)
- Blocker: 0 open.
- Critical: 0 open.
- High: <= agreed threshold with accepted mitigation.
- Medium/Low: managed in post-release backlog.

## Метрики тестовых гейтов (минимум)
- Smoke pass rate.
- Critical scenario pass rate.
- Flaky ratio.
- Defect leakage trend.
- Mean time to detect and resolve.

## Метрики мониторинговых гейтов
- API error rate.
- P95 latency by endpoint.
- Assistant success-to-fallback ratio.
- External provider availability.
- Web Vitals фронтенда.

## Управленческие встречи и входы
- Product Review:
- scope, KPI, decisions.
- Architecture Board:
- ADR, constraints, tech risks.
- Quality Board:
- test coverage, defects, gate status.
- Release Board:
- readiness decision.

## Шаблон для Confluence (страница RTM)
### 1. Сводка покрытия
- % BR covered by FR
- % FR covered by tests

### 2. Пробелы
- Missing mappings
- Risk impact

### 3. Действия
- Owner
- Due date

### 4. Статус гейтов
- Результаты по каждому гейту

## Минимальные рекомендации по инструментам
- Единый ID namespace для BR/FR/NFR/Test.
- Автоэкспорт тест-результатов в RTM репорт.
- Дашборд качества релиза для PO/PM/QA/Architects.
