# Backend - Hiring Optimization & Automation Platform

NestJS 11 + TypeORM + PostgreSQL API + Mocha, Chai, Sinon for testing.

For what the project is, how the matching and clustering work, the architecture diagrams and the
live demo, see the [root README](../README.md).

## Run it

```bash
cp .env.example .env          # fill with real secrets
docker compose up -d          # PostgreSQL on the port from DB_PORT
npm ci
npm run migration:run
npm run db:seed               # optional: demo companies, users, vacancies
npm run start:dev
```

The API listens on `PORT` (3000 by default). Swagger is at http://localhost:3000/api/docs.

It refuses to start if a required environment variable is missing, so a bad config fails at boot
rather than at the first request.

## Tests

```bash
npm test
```

499 specs across 14 suites, run with Mocha, Chai and Sinon against a real PostgreSQL instance.

No setup needed. `test/hooks.ts` brings up a throwaway Postgres container (`test/docker-compose.yml`,
port 65432, tmpfs storage with `fsync=off` for speed), waits for `pg_isready`, creates the `ut_test`
database, runs the suite and tears the container down afterwards.

Set `WITHOUT_DOCKER=1` to skip provisioning and run against a database you started yourself.

## Migrations

Schema changes are versioned. Never use `synchronize`.

```bash
npm run migration:generate -- src/migrations/DescribeTheChange
npm run migration:run
npm run migration:revert
npm run migration:show
```

In production the compiled migrations run instead: `npm run migration:run:prod`.

## Module layout

Organised by domain. Each module owns its controller, service, DTOs, mappers and specs.

| Module              | Responsibility                                         |
| ------------------- | ------------------------------------------------------ |
| `auth`              | login, rotating refresh tokens, logout, password reset |
| `user`              | user CRUD and role management                          |
| `tenant`            | companies, super-admin only                            |
| `candidateProfile`  | experience, location, language proficiencies           |
| `vacancy`           | vacancies, requirements, filtering                     |
| `question`          | reusable question bank per company                     |
| `vacancySubmission` | applications, match scoring, filtering                 |
| `clustering`        | feature vectors, k-means, cron re-clustering           |
| `interview`         | scheduling, cancellation, email notifications          |
| `sapling`           | AI-generated-text detection                            |
| `mail`              | SendGrid wrapper                                       |

Cross-cutting concerns live in `guards/` (RBAC), `middlewares/` (JWT), `interceptors/` (tenant
scoping, serialization) and `decorators/`.
