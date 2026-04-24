# Досье для системного архитектора

## Цель
- Определить платформенную и инфраструктурную архитектуру production-системы.

## Топология окружений
- `dev` -> `test` -> `stage` -> `prod`.
- Изоляция секретов и конфигурации по окружениям.
- Feature toggles per environment.

## Базовый инфраструктурный контур
- Контейнеризация сервисов.
- IaC (Terraform/Pulumi) как single source of infra truth.
- Managed DB + managed cache.
- Centralized logging/metrics/tracing.

## Архитектура исполнения
- Edge/web layer (CDN + WAF).
- App layer (FE hosting + BFF/API services).
- Data layer (OLTP + object storage + analytics).
- Integration layer (connectors/adapters for external systems).

## Архитектура безопасности
- IAM model:
- SSO/OIDC for users.
- service-to-service auth (mTLS/JWT).
- Secret management:
- KMS/Vault-like storage.
- rotation policy.
- Network controls:
- private subnets for data services.
- egress restrictions for AI provider calls.

## Архитектура надежности
- Multi-AZ deployment for critical services.
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
- Golden signals dashboards:
- latency,
- traffic,
- errors,
- saturation.
- Product metrics dashboards linked to technical telemetry.

## Резервирование и DR
- Backup schedule for DB/object storage.
- Restore drills quarterly.
- DR runbooks:
- regional outage,
- external provider outage,
- data corruption.

## Платформенные операции
- On-call rotation.
- Incident severity matrix.
- Postmortem process (blameless).
- SRE scorecard for service maturity.

## Контроли соответствия (enterprise baseline)
- Access logging and audit retention.
- PII handling policy and masking.
- Vulnerability scanning and dependency governance.
- Security patch SLA.

## Шаблон для Confluence (страница системной архитектуры)
### 1. Обзор
- Область
- Services/components

### 2. Инфраструктура
- Environment map
- Deployment model

### 3. Безопасность
- IAM
- Secrets
- Network controls

### 4. Надежность
- HA
- DR
- Runbooks

### 5. Наблюдаемость
- Metrics
- Alerts
- Dashboards

### 6. Операции
- On-call
- Incident process

## Первые системно-архитектурные артефакты
- Environment blueprint.
- Security model v1.
- DR strategy.
- Observability standards.
- Ops runbook set.
