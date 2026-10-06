<h2 align="center">Medigo ⚕</h2>️
<p align="center">
Enterprise-grade full-stack booking platform for doctors and patients using event-driven microservices architecture.
</p>

<div align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white" alt="Java">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?logo=spring&logoColor=white" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Spring%20Cloud-Microservices-6DB33F?logo=spring&logoColor=white" alt="Spring Cloud">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/OpenTelemetry-Observability-7B42BC?logo=opentelemetry&logoColor=white" alt="Observability">
  <img src="https://img.shields.io/badge/Event%20Driven-Apache%20Kafka-231F20?logo=apachekafka&logoColor=white" alt="Event Driven">
  <img src="https://img.shields.io/badge/Resilience4j-Fault%20Tolerance-D32F2F" alt="Resilience4j">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</div>

![architecture](/public/diagrams/architecture-diagram.png)

## 1. Project Overview

### Problem Statement

Traditional appointment systems often become hard to scale when authentication, doctor onboarding, scheduling, payments,
and notifications are tightly coupled in a monolith.

### Why This Application Was Built

This project was built to demonstrate production-style microservice architecture skills for a senior backend role,
including:

- service decomposition
- centralized config and discovery
- secure gateway-driven auth
- async domain events
- resilience, observability, and containerized deployment

### High-Level Objective

Deliver a modular healthcare platform where patients can find doctors, book/pay for appointments, receive notifications,
and submit feedback while admins can verify doctors.

### Business Value

- faster feature delivery via independent services
- higher reliability via isolation + circuit breakers + retries
- cleaner security boundary through API gateway and internal APIs
- scalability for high-traffic modules (appointments, payments, notifications)

---

## 2. Project Description

### What the Application Does

Medigo supports end-to-end lifecycle:

1. patient/doctor registration and login
2. doctor onboarding, clinic setup, schedule creation
3. slot generation and appointment booking
4. payment initiation/verification (Razorpay/Stripe)
5. event-driven notifications and refund handling
6. feedback workflow after appointment completion
7. admin doctor-verification workflow

### Main User Journey

1. Patient registers and logs in.
2. Patient searches doctors and views public profile.
3. Patient selects clinic/date/slot and books appointment (pending payment).
4. Patient pays and verifies payment.
5. Appointment becomes confirmed.
6. Doctor completes appointment.
7. Patient gets feedback eligibility and submits review.

### Core Modules

- Identity and auth (`auth`)
- Patient profile and address (`patient`)
- Doctor onboarding/clinic/schedule (`doctor`)
- Appointment and slot orchestration (`appointment`)
- Payment and refunds (`payment`)
- Notification center (`notification`)
- Feedback and ratings (`feedback`)
- Admin operations (`admin`)
- Infra: gateway, config server, eureka

---

## 3. Architecture Overview

### High-Level Architecture

- **API Gateway**: single ingress, JWT validation, rate limiting, header propagation.
- **Config Server**: centralized externalized config from Git.
- **Eureka**: service registry/discovery.
- **Domain Services**: 8 business microservices.
- **Datastores**:
    - PostgreSQL (schema-per-service for relational workloads)
    - MongoDB (document model for notification/feedback)
    - Redis (token blacklist, gateway rate limiting, slot lock/cache use cases)
- **Messaging**: RabbitMQ topic exchange for domain events + Spring Cloud Bus refresh.
- **Observability**: Actuator + Micrometer + Prometheus + Grafana + Loki (+ optional Tempo/OTel).

### Request Lifecycle

1. Client calls `api-gateway`.
2. Gateway validates JWT (RSA public key), checks blacklist in Redis.
3. Gateway injects trusted `X-User-Id` and `X-User-Role`.
4. Route forwarded using Eureka (`lb://service-name`).
5. Service-level `GatewayAuthFilter` builds Spring Security context from headers.
6. `@PreAuthorize` enforces role access.

### Sync vs Async Communication

- **Synchronous (Feign)**: strong consistency paths (auth->profile creation, payment->appointment confirm, admin
  aggregation).
- **Asynchronous (RabbitMQ)**: decoupled post-state side effects (notifications, refunds, feedback eligibility).

### Architectural Decisions

- **Gateway-centric auth** avoids duplicate token parsing logic in every service.
- **Internal APIs (`/api/internal/**`)\*\* separate service-to-service calls from public APIs.
- **Event-driven side effects** reduce tight runtime coupling.
- **Schema-per-service** keeps bounded ownership while sharing one Postgres instance in dev.
- **Circuit breaker/retry** added for external or cross-service calls (Resilience4j).

---

## 4. Tech Stack Documentation

### Backend

| Technology                  | What it is                | Why chosen / Problem solved                      |
|-----------------------------|---------------------------|--------------------------------------------------|
| Java 21                     | LTS JVM runtime           | modern language/runtime for enterprise services  |
| Spring Boot 3.4.x           | app framework             | rapid service bootstrap with production features |
| Spring Security             | authz framework           | role-based endpoint protection                   |
| Spring Cloud Gateway        | reactive API gateway      | centralized routing, auth filter, rate limiting  |
| Spring Cloud Config         | centralized configuration | externalized, versioned configuration management |
| Eureka                      | service discovery         | dynamic service registry for `lb://` routing     |
| OpenFeign                   | declarative HTTP clients  | simple inter-service sync calls                  |
| Resilience4j                | CB/retry                  | resilience against downstream failures           |
| Spring Data JPA + Hibernate | ORM                       | relational domain persistence                    |
| Spring Data MongoDB         | document persistence      | flexible models for notifications/feedback       |
| Flyway                      | DB migration              | versioned schema changes                         |
| RabbitMQ (AMQP)             | message broker            | async event flow + Cloud Bus refresh             |
| Redis                       | in-memory data store      | token blacklist + gateway rate limiting          |
| jjwt                        | JWT parser/validator      | token signature/claims validation                |
| springdoc OpenAPI           | API docs                  | self-documenting endpoints via Swagger UI        |
| Micrometer + Actuator       | metrics/health            | standardized telemetry endpoints                 |

### Frontend

- React 19 + TypeScript + Vite
- React Router
- React Query
- Zustand
- Axios
- Tailwind CSS

### Database

- **PostgreSQL**: auth, patient, doctor, appointment, payment (strong transactional consistency).
- **MongoDB**: notification, feedback (document-centric, flexible payloads).

### Messaging

- RabbitMQ topic exchange for appointment domain events.
- Spring Cloud Bus over RabbitMQ for distributed config refresh.

### Containerization & Build

- Docker + Docker Compose (dev/local/observability stacks).
- Jib Maven plugin for container image builds.

### Observability

- Prometheus: metrics scraping
- Grafana: dashboards
- Loki: log aggregation
- Alloy: Docker log shipping to Loki
- Tempo: tracing backend config present (service currently commented in compose)
- OpenTelemetry Java agent: compose/env hints present, optional/in-progress

---

## 5. Complete Microservice Breakdown

| Service         | Port | Purpose                                              | Database                    | Key Dependencies                       |
|-----------------|-----:|------------------------------------------------------|-----------------------------|----------------------------------------|
| `api-gateway`   | 8080 | ingress, JWT validation, route+rate limit            | Redis                       | Eureka, auth public key                |
| `config-server` | 8888 | centralized config from Git + bus refresh            | -                           | RabbitMQ                               |
| `eureka-server` | 8761 | service discovery registry                           | -                           | config-server                          |
| `auth`          | 8081 | registration/login/token lifecycle/user state        | PostgreSQL (`auth` schema)  | patient, doctor, Redis                 |
| `patient`       | 8082 | patient profile/address/photo                        | PostgreSQL (`patient`)      | Cloudinary, doctor (search/public)     |
| `doctor`        | 8083 | doctor profile, onboarding, clinics, schedules, docs | PostgreSQL (`doctor`)       | appointment (slot generation), auth    |
| `appointment`   | 8084 | slots, booking, status transitions                   | PostgreSQL (`appointment`)  | doctor, RabbitMQ, Redis                |
| `payment`       | 8085 | payment initiation/verify/history/refund             | PostgreSQL (`payment`)      | appointment, RabbitMQ, Razorpay/Stripe |
| `notification`  | 8086 | user notifications feed                              | MongoDB (`notification_db`) | RabbitMQ                               |
| `feedback`      | 8087 | review/rating workflow                               | MongoDB (`feedback_db`)     | RabbitMQ                               |
| `admin`         | 8088 | doctor verification + analytics                      | none (aggregator)           | doctor, auth                           |

---

## 6. API Documentation (Service-wise)

### Common Headers

- `Authorization: Bearer <access_token>` for protected APIs.
- Gateway injects trusted internal headers: `X-User-Id`, `X-User-Role`.

### Auth Service (`/api/auth`, `/api/users`, `/api/internal`)

- `POST /api/auth/register/patient`
- `POST /api/auth/register/doctor`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/users/logout`
- `GET /api/users/me`
- Internal:
    - `PATCH /api/internal/auth/update-status`
    - `GET /api/internal/users/count?role=ROLE_PATIENT|ROLE_DOCTOR|ROLE_ADMIN`

Sample request (`POST /api/auth/login`):

```json
{
  "phoneNumber": "9876543210",
  "password": "secret123"
}
```

Sample response shape:

```json
{
  "success": true,
  "status": 200,
  "message": "Login Successful",
  "data": {
    "user": {},
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  },
  "timestamp": "..."
}
```

### Patient Service

- Profile:
    - `GET /api/patient/profile`
    - `PUT /api/patient/profile`
    - `PATCH /api/patient/profile/upload-photo` (multipart `file`)
    - `DELETE /api/patient/profile/remove-photo`
- Address:
    - `POST /api/patient/addresses`
    - `GET /api/patient/addresses`
    - `PATCH /api/patient/addresses`
    - `DELETE /api/patient/addresses`
- Internal:
    - `POST /api/internal/patient/create-profile`

### Doctor Service

- Doctor:
    - `GET /api/doctor/profile`
    - `PUT /api/doctor/profile`
    - `PATCH /api/doctor/profile/upload-photo`
    - `DELETE /api/doctor/profile/remove-photo`
    - `POST /api/doctor/onboarding/complete`
- Clinics:
    - `POST /api/doctor/clinics`
    - `GET /api/doctor/clinics`
    - `PUT /api/doctor/clinics/{clinicId}`
    - `DELETE /api/doctor/clinics/{clinicId}`
- Clinic schedules:
    - `POST /api/doctor/clinics/{clinicId}/schedule`
    - `GET /api/doctor/clinics/{clinicId}/schedule`
    - `PUT /api/doctor/clinics/{clinicId}/schedule`
    - `DELETE /api/doctor/clinics/{clinicId}/schedule/{dayOfWeek}`
- Documents:
    - `PATCH /api/doctor/documents/upload`
- Public:
    - `GET /api/doctor/search`
    - `GET /api/doctor/{doctorId}/public`
- Internal:
    - `POST /api/internal/doctor/create-profile`
    - `GET /api/internal/doctor/clinics/{clinicId}/fees`
    - `GET /api/internal/doctor/pending-verification`
    - `GET /api/internal/doctor/{doctorId}/documents`
    - `PATCH /api/internal/doctor/{doctorId}/verification-status`

### Appointment Service

- `GET /api/appointment/slots/{doctorId}/{clinicId}?date=YYYY-MM-DD`
- `POST /api/appointment/book`
- `GET /api/appointment/{appointmentId}`
- `PATCH /api/appointment/{appointmentId}/cancel`
- `PATCH /api/appointment/{appointmentId}/complete`
- `PATCH /api/appointment/{appointmentId}/no-show`
- `GET /api/appointment/patient/history?page=0&size=10`
- `GET /api/appointment/doctor/today`
- `GET /api/appointment/doctor/history?page=0&size=10`
- Internal:
    - `POST /api/internal/appointment/slots/generate`
    - `DELETE /api/internal/appointment/slots/cancel-available/{clinicId}/{dayOfWeek}`
    - `POST /api/internal/appointment/confirm-payment`
    - `GET /api/internal/appointment/{appointmentId}`
    - `POST /api/internal/appointment/{appointmentId}/release-slot`

Sample request (`POST /api/appointment/book`):

```json
{
  "slotId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Payment Service

- `POST /api/payment/initiate`
- `POST /api/payment/verify`
- `GET /api/payment/history?page=0&size=10`
- `GET /api/payment/appointment/{appointmentId}`

Sample request (`POST /api/payment/initiate`):

```json
{
  "appointmentId": "<id>",
  "gatewayType": "RAZORPAY"
}
```

Sample request (`POST /api/payment/verify`, Razorpay):

```json
{
  "appointmentId": "<id>",
  "razorpayOrderId": "order_x",
  "razorpayPaymentId": "pay_x",
  "razorpaySignature": "sig_x"
}
```

### Notification Service

- `GET /api/notification?page=0&size=10&isRead=false&type=...&category=...`
- `GET /api/notification/unread-count`
- `PATCH /api/notification/{notificationId}/read`
- `PATCH /api/notification/read-all`
- `DELETE /api/notification/{notificationId}`
- `DELETE /api/notification/all`

### Feedback Service

- `POST /api/feedback/doctor/{doctorId}`
- `GET /api/feedback/doctor/{doctorId}?page=0&size=10` (public)
- `GET /api/feedback/patient/my?page=0&size=10`
- `GET /api/feedback/doctor/my?page=0&size=10`
- `PUT /api/feedback/{feedbackId}`
- `DELETE /api/feedback/{feedbackId}`

### Admin Service

- `GET /api/admin/doctors/pending`
- `PATCH /api/admin/doctors/{doctorId}/verify`
- `PATCH /api/admin/doctors/{doctorId}/reject`
- `GET /api/admin/analytics/overview`

### Error Response Pattern

All services use a consistent error envelope:

```json
{
  "success": false,
  "error": {
    "type": "VALIDATION|BUSINESS|AUTH|...",
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "status": 400,
    "timestamp": "...",
    "path": "/api/...",
    "errors": [
      {
        "field": "name",
        "message": "must not be blank"
      }
    ]
  }
}
```

---

## 7. Inter-Service Communication Mapping

### Feign Communication

- `auth -> patient`: create patient profile (`POST /api/internal/patient/create-profile`)
- `auth -> doctor`: create doctor profile (`POST /api/internal/doctor/create-profile`)
- `doctor -> appointment`: generate/cancel slots (`/api/internal/appointment/...`)
- `appointment -> doctor`: fetch clinic fees (`GET /api/internal/doctor/clinics/{clinicId}/fees`)
- `payment -> appointment`: get appointment, confirm payment, release slot (`/api/internal/appointment/...`)
- `admin -> doctor`: pending doctors/documents/status updates (`/api/internal/doctor/...`)
- `admin -> auth`: role counts + account status updates (`/api/internal/...`)
- `doctor -> auth`: update account status after onboarding/verification flow
- `patient -> doctor`: doctor search/public profile consumption

### RabbitMQ Communication

- Producer: `appointment`
- Exchange: configured topic exchange (`rabbitmq.exchange.name`)
- Routing keys produced:
    - `appointment.confirmed`
    - `appointment.cancelled`
    - `appointment.completed`
    - `appointment.no_show`
    - `appointment.payment_failed`

Consumers:

- `notification` queue (`appointment.#`) -> creates in-app notifications.
- `payment` queue (`appointment.cancelled`) -> refund compensation flow.
- `feedback` queue (`appointment.completed`) -> feedback eligibility creation.

---

## 8. RabbitMQ Configuration

### Exchange

- Topic exchange from `rabbitmq.exchange.name`.

### Queues & Bindings

- Notification queue: bound with `appointment.#`.
- Payment queue: bound with `appointment.cancelled` (and in appointment config also `appointment.confirmed` binding
  exists for payment queue).
- Feedback queue: bound with `appointment.completed`.

### Retry / DLQ

- Explicit DLQ is **not configured** currently.
- Consumers catch/log exceptions to avoid poison-message infinite requeue.
- Code comments indicate DLQ is planned future enhancement.

### Message Flow

1. Appointment status changes.
2. Appointment service publishes event to exchange.
3. Rabbit routes by routing key.
4. Consumers persist notifications, trigger refunds, or grant feedback eligibility.

---

## 9. Security Documentation

### Authentication Flow

1. User logs in via `auth` and receives access + refresh tokens.
2. Access token signed with RSA private key (auth service).
3. API gateway validates token using RSA public key.
4. Gateway checks token `jti` blacklist in Redis.

### Authorization

- Gateway injects trusted identity headers.
- Service `GatewayAuthFilter` builds `SecurityContext`.
- Endpoint-level `@PreAuthorize` enforces role access.

### JWT/Token Notes

- Public routes: registration/login/refresh, doctor public search/profile, health/info/docs.
- Internal endpoints blocked externally at gateway (`/internal/` forbidden from outside).
- Logout invalidates tokens through blacklist flow.

### Gateway-Level Security Controls

- token validation + claim checks (`sub`, `role`, `jti`)
- anti-header-spoofing (removes client supplied `X-User-*`, adds verified values)
- Redis rate limiting with route-specific policies (auth/payment/admin stricter/adjusted)

---

## 10. Database Design

### PostgreSQL (schemas)

- `auth`: `users`, `refresh_token`
- `patient`: `patients`, `address`
- `doctor`: `doctors`, `doctor_profiles`, `doctor_documents`, `clinics`, `clinic_schedules`, `doctor_languages`
- `appointment`: `appointments`, `slots`
- `payment`: `payment_records`, `payment_gateway_details`

### MongoDB

- `notification_db.notifications`
- `feedback_db.feedbacks`
- `feedback_db.feedback_eligibility`

### Relationship Overview (text ER)

- `users (auth)` 1->1 logical with `patients` / `doctors`
- `doctors` 1->many `clinics`
- `clinics` 1->many `clinic_schedules`
- `doctors` 1->1 `doctor_profiles`
- `doctors` 1->many `doctor_documents`
- `appointments` references `slot`, patient, doctor, clinic IDs
- `payment_records` 1->1 `payment_gateway_details`
- `feedback_eligibility` and `feedbacks` keyed by `appointmentId`

---

## 11. Configuration Management

- Services import config via `spring.config.import=configserver:http://localhost:8888`.
- Config server sources from Git repo (`medigo-config`).
- Profiles: primarily `dev`, with `docker` overlay in containerized runtime.
- Cloud Bus refresh endpoint available (`/actuator/busrefresh`) to propagate config updates.
- Encryption support in config server (`encrypt.key`) for encrypted `{cipher}` values.
- Secret handling expectation:
    - keep `.env` out of VCS
    - inject via environment variables/secrets manager in prod
    - keep RSA keys under mounted secret path

---

## 12. Docker & Deployment

### Docker Compose Layers

- `infra.yaml`: RabbitMQ, Redis
- `databases.yaml`: PostgreSQL, MongoDB
- `services.yaml`: config/eureka/all app services/gateway
- `observability-and-monitoring.yaml`: Prometheus/Grafana/Loki/Alloy (+ Tempo config)

### Startup Order

`infra -> db -> config-server -> eureka -> business services -> api-gateway`

### Networking

- shared bridge network: `medigo_network`
- inter-container DNS by service names

### Volumes

- persistent data for PostgreSQL, MongoDB, RabbitMQ, Redis
- mounted `init_db.sql`
- mounted RSA key directory into auth and gateway containers

### Health Checks

- configured for most infra/services using actuator or native commands (`pg_isready`, `redis-cli ping`, etc.)

---

## 13. Monitoring & Observability

### Metrics

- All services expose `/actuator/prometheus`.
- Prometheus scrapes gateway, infra services, and all domain services.

### Logging

- Structured service logs shipped by Grafana Alloy from Docker daemon.
- Loki stores centralized logs.
- Grafana can query logs and correlate with traces (Tempo datasource wired).

### Tracing

- Tempo config present.
- OTel Java agent config scaffold present in compose (`JAVA_TOOL_OPTIONS`, OTLP endpoint), but rollout is
  partial/commented in places.

### Dashboards & Alerts

- Grafana datasources provisioned for Prometheus/Loki/Tempo.
- Alerting rules are not explicitly defined in current repo.

---

## 14. Folder Structure

```text
infrastructure/
  api-gateway/
  config-server/
  eureka-server/
services/
  auth/
  patient/
  doctor/
  appointment/
  payment/
  notification/
  feedback/
  admin/
docker/
  docker-compose/
    dev/
    local/
    observability/
secrets/
public/
web/
```

- `infrastructure/*`: platform-level services
- `services/*`: business microservices
- `docker/docker-compose/dev`: fully containerized environment
- `docker/docker-compose/local`: infra-only for running services from IDE
- `docker/docker-compose/observability`: monitoring/logging stack configs
- `web`: React frontend client

---

## 15. Design Patterns & Best Practices Used

- Layered architecture (controller -> service -> repository)
- DTO mapping (`payload/request`, `payload/response`, mapper classes)
- Saga-style choreography for payment/refund lifecycle
- Event-driven architecture with topic routing
- Idempotency guards (feedback eligibility, payment state checks)
- Circuit breaker + retry (Resilience4j)
- Optimistic locking (`@Version`) in appointment/slot entities
- Standardized response/error wrapper
- Centralized exception handling per service
- Security boundary with gateway + internal API segregation

---

## 16. Setup Guide

### Prerequisites

- Java 21
- Maven 3.9+
- Docker Desktop
- Node 20+ (for frontend)

### Option A: Full Docker (recommended)

```bash
cd docker/docker-compose/dev
cp .env.example .env
make up
```

Access:

- API Gateway: `http://localhost:8080`
- Eureka: `http://localhost:8761`
- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- RabbitMQ UI: `http://localhost:15672`

### Option B: Run infra in Docker, services from IDE

```bash
cd docker/docker-compose/local
make up-db
```

Then start services in this order:

1. config-server
2. eureka-server
3. auth, patient, doctor, appointment, payment, notification, feedback, admin
4. api-gateway

### Frontend

```bash
cd web
npm install
npm run dev
```

---

## 17. Testing

### Current Test Coverage in Repo

- Basic Spring Boot context tests present in all services (`*ApplicationTests`).
- Utility test file present in auth (`PasswordGenerator`).

### How to Run

```bash
# service-wise
cd services/auth && mvn test
cd services/appointment && mvn test
# repeat for others
```

### API Testing

- Use Postman/Insomnia through gateway (`localhost:8080`).
- Authenticate first and reuse bearer token for protected flows.
- Validate async side effects (notifications/refunds/feedback eligibility) by checking respective service data stores.

---

## 18. Future Improvements

1. Add DLQ + retry/backoff policy for RabbitMQ consumers.
2. Complete OpenTelemetry rollout with distributed trace propagation across all services.
3. Add contract tests for Feign/internal APIs and event schemas.
4. Introduce CI pipeline for unit/integration/security checks.
5. Add Testcontainers-based integration tests for Postgres/Mongo/Rabbit/Redis.
6. Externalize secrets to vault/secret manager for production.
7. Add Kubernetes manifests/Helm charts and HPA policy for scale-out.
8. Add idempotency keys for payment initiation requests at API level.

---

## Appendix: Quick API Catalog

### Public/Client APIs by Service

- Auth: `/api/auth/*`, `/api/users/*`
- Patient: `/api/patient/profile`, `/api/patient/addresses`
- Doctor: `/api/doctor/*` (including `/search`, `/{id}/public`)
- Appointment: `/api/appointment/*`
- Payment: `/api/payment/*`
- Notification: `/api/notification/*`
- Feedback: `/api/feedback/*`
- Admin: `/api/admin/*`

### Internal APIs (service-to-service)

- `/api/internal/auth/*`
- `/api/internal/users/*`
- `/api/internal/patient/*`
- `/api/internal/doctor/*`
- `/api/internal/appointment/*`

> Note: Gateway blocks external access to internal endpoints.
