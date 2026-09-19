# Frontend - Hiring Optimization & Automation Platform

React 19 + TypeScript + Vite SPA.

For what the project is, the architecture diagrams, the live demo and the demo accounts, see the
[root README](../README.md).

## Run it

```bash
cp .env.example .env
npm ci
npm run dev                   # http://localhost:5173
```

On every push these three comands will be run (see
[root .github\workflows](../.github/workflows/frontend-ci.yml):

```bash
npm run typecheck
npm run lint
npm run build
```

## How state is organised

Server state and client state are kept apart on purpose.

- **Server state** goes through RTK Query (`src/app/api/baseApi.ts`). Endpoints declare tags, mutations invalidate them, and the cache refetches itself. No manual loading flags, no data copied into Redux.
- **Client state** lives in Redux Toolkit slices, and only for things the client genuinely owns: the session and filter state.

`prepareHeaders` attaches the access token to every request except those marked
`PUBLIC_ENDPOINT`. `RestoreSession` dispatches a refresh on mount, so a page reload keeps you
logged in. `RequireAuth` and `RequireRole` guard the routes.

## Layout

```
src/
├── app/        store, RTK Query base API, theme, config
├── features/   auth, vacancies, vacancySubmissions, interviews,
│               questions, profile, clustering, home
├── routing/    RequireAuth, RequireRole, RestoreSession, routes
├── layout/     shell, navigation
└── shared/     reusable UI, hooks, helpers
```

Each feature owns its `api/`, `model/`, `components/` and `pages/`, so a feature can be read or
removed on its own.

## Screenshots

**Sign in**

<img width="622" alt="Sign in page" src="./attachments/login.png" />

**Creating a vacancy**

<img width="822" alt="Create vacancy form" src="https://github.com/user-attachments/assets/600cfdee-2724-42f8-b00f-cc559dd8ddfc" />
<img width="795" alt="Create vacancy questions" src="https://github.com/user-attachments/assets/153ffd1b-9dcb-4e7f-868d-98f9ec1a15b3" />

**Filtering vacancies**

<img width="823" alt="Vacancy filters" src="https://github.com/user-attachments/assets/e4ff5568-d8a9-4542-8027-f39808487f6d" />

**Vacancy list**

<img width="1881" alt="Vacancy list" src="https://github.com/user-attachments/assets/6ee1de6a-d424-4dd7-ae8d-5255166cb44c" />

**My Profile Page**
<img width="1881" alt="Vacancy list" src="./attachments/my-profile.png" />
