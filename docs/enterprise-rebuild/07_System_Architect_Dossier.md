# Досье для системного архитектора

## Цель
- Определить платформенную и инфраструктурную архитектуру промышленной системы.

## Топология окружений
- `dev` -> `test` -> `stage` -> `prod`.
- Изоляция секретов и конфигурации по окружениям.
- Фича-флаги по окружениям.

## Базовый инфраструктурный контур
- Контейнеризация сервисов.
- IaC (Terraform/Pulumi) как единый источник правды по инфраструктуре.
- Управляемая БД + управляемый кэш.
- Централизованные логи/метрики/трейсинг.

## Архитектура исполнения
- Edge/web layer (CDN + WAF).
- Прикладной слой (FE-хостинг + BFF/API сервисы).
- Data layer (OLTP + object storage + analytics).
- Integration layer (connectors/adapters for external systems).

## Архитектура безопасности
- IAM model:
- SSO/OIDC for users.
- service-to-service auth (mTLS/JWT).
- Secret management:
- KMS/Vault-like storage.
- политика ротации.
- Network controls:
- приватные подсети для сервисов данных.
- ограничения исходящего трафика для вызовов AI-провайдеров.

## Архитектура надежности
- Мульти-AZ развёртывание для критичных сервисов.
- Health checks + auto-restart.
- Circuit breakers for external dependencies.
- Retry budgets and timeout standards.

## Архитектура производительности
- CDN caching for static assets.
- API response caching for read-mostly endpoints.
- Queueing for non-interactive heavy tasks.
- Connection pooling and DB index strategy.

## Архитектура наблюдаемости
- Structured logs with trace IDs.
- Дашборды golden signals:
- latency,
- traffic,
- errors,
- saturation.
- Дашборды продуктовых метрик, связанные с технической телеметрией.

## Резервирование и DR
- Backup schedule for DB/object storage.
- Restore drills quarterly.
- DR-ранбуки:
- regional outage,
- external provider outage,
- data corruption.

## Платформенные операции
- On-call rotation.
- Incident severity matrix.
- Postmortem process (blameless).
- SRE-скоркард зрелости сервисов.

## Контроли соответствия (базовый enterprise-профиль)
- Access logging and audit retention.
- Политика работы с PII и маскирование.
- Сканирование уязвимостей и контроль зависимостей.
- Security patch SLA.

## Шаблон для Confluence (страница системной архитектуры)
### 1. Обзор
- Область
- Сервисы/компоненты

### 2. Инфраструктура
- Карта окружений
- Модель развёртывания

### 3. Безопасность
- IAM
- Secrets
- Network controls

### 4. Надежность
- HA
- DR
- Runbooks

### 5. Наблюдаемость
- Метрики
- Алерты
- Дашборды

### 6. Операции
- Дежурства on-call
- Процесс инцидентов

## Первые системно-архитектурные артефакты
- Блюпринт окружений.
- Security model v1.
- DR strategy.
- Observability standards.
- Набор операционных ранбуков.
