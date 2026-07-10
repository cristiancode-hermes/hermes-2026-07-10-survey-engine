# Hermes Survey Engine

**A multi-tenant survey and form builder** — create surveys with 7 question types, collect responses, and analyze results with real-time charts and CSV export.

Built from [UX designer specs](../../../../hermes-design-specs/2026-07-10/) (DONE.marker found).

## Features

- **7 Question Types:** Text, Single Choice, Multiple Choice, Rating (1-5), Yes/No, Dropdown, NPS (0-10)
- **Survey Builder:** Three-panel editor — question palette, live preview, property inspector
- **Auto-Save:** Drafts saved automatically every 30 seconds
- **Multi-Tenant:** Organization-scoped surveys, responses, and users
- **Public Response Page:** Clean, mobile-friendly page for respondents (no auth required)
- **Results Dashboard:** KPI cards (total responses, completion rate, NPS), per-question charts (bar, donut, rating distribution, NPS colored bar), CSV export
- **Survey Templates:** NPS, Customer Satisfaction, Event Feedback
- **Dark Mode:** Full CSS variable-based dark mode
- **JWT Authentication:** Register/login with bcryptjs + Passport

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 + Signals + Zoneless + Tailwind CSS v4 |
| Backend | NestJS 11 + TypeORM + better-sqlite3 |
| Database | SQLite (dev) / PostgreSQL with Neon (prod) |
| Auth | JWT (Passport) + bcryptjs |
| API Docs | Swagger at `/api/docs` |

## Architecture

```
apps/
├── api/          # NestJS backend
│   ├── src/
│   │   ├── auth/         # JWT auth (register, login, me)
│   │   ├── surveys/      # Survey CRUD + publish/close/reopen
│   │   ├── questions/    # Question CRUD + reorder
│   │   ├── responses/    # Response submission + listing
│   │   ├── results/      # Aggregation + chart data + CSV export
│   │   ├── settings/     # Profile + password management
│   │   ├── templates/    # Survey template listing
│   │   ├── seed/         # Auto-seed on first start
│   │   └── common/       # Shared DTOs
│   └── data/             # SQLite database file
├── web/          # Angular frontend
│   └── src/app/
│       ├── core/         # Services, guards, interceptors, types
│       ├── pages/        # Login, Register, Dashboard, Builder, Results, Public, Settings, 404
│       └── shared/       # Header, Toast, ConfirmDialog, Skeleton
└── docs/         # Documentation
```

## Setup

### Prerequisites
- Node.js 24+
- npm

### Backend
```bash
cd apps/api
cp .env.example .env
npm install
npm run build
npm run start:dev    # http://localhost:3000
# Swagger docs: http://localhost:3000/api/docs
```

### Frontend
```bash
cd apps/web
cp .env.example .env
npm install
npm run start       # http://localhost:4200
```

### Seed Data
The backend auto-seeds on first start:
- **Org:** Acme Corp, Startup Inc
- **Users:** admin@acme.com / password123, user@startup.io / password123
- **Surveys:** NPS Annual (active), Customer Satisfaction (active), Product Feedback (draft)
- **Templates:** NPS, Customer Satisfaction, Event Feedback

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register + create org |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/surveys` | Yes | List surveys (paginated, filterable) |
| POST | `/api/surveys` | Yes | Create survey |
| GET | `/api/surveys/:id` | Yes | Get survey with questions |
| PATCH | `/api/surveys/:id` | Yes | Update survey |
| DELETE | `/api/surveys/:id` | Yes | Delete survey |
| POST | `/api/surveys/:id/publish` | Yes | Publish survey |
| POST | `/api/surveys/:id/close` | Yes | Close survey |
| POST | `/api/surveys/:id/reopen` | Yes | Reopen survey |
| GET | `/api/surveys/:id/questions` | Yes | List questions |
| POST | `/api/surveys/:id/questions` | Yes | Add question |
| PATCH | `/api/questions/:qid` | Yes | Update question |
| DELETE | `/api/questions/:qid` | Yes | Delete question |
| PATCH | `/api/surveys/:id/questions/reorder` | Yes | Reorder questions |
| GET | `/api/survey/:slug` | No | Get public survey |
| POST | `/api/surveys/:id/responses` | No | Submit response |
| GET | `/api/surveys/:id/responses` | Yes | List responses |
| GET | `/api/surveys/:id/results` | Yes | Get results + chart data |
| GET | `/api/templates` | Yes | List templates |
| PATCH | `/api/settings/profile` | Yes | Update profile |
| PATCH | `/api/settings/password` | Yes | Change password |

## Roadmap
- CSV export of responses
- Logic branching (show/hide questions)
- Survey scheduling
- Embedded survey via iframe
- AI question suggestions (next AI cycle, counter=4)

## License
MIT
