# Decisions Log

## ADR-1: Multi-tenant via organizationId FK
- **Context:** Survey data must be isolated between organizations
- **Decision:** Every entity (Survey, Question, Response) has an `organizationId` FK column. All service methods receive `orgId` from JWT and filter by it.
- **Alternatives:** Separate databases per org (too complex), RLS policies (Neon-specific)
- **Status:** Accepted

## ADR-2: SQLite for dev, PostgreSQL for prod
- **Context:** Need to develop without Neon connection
- **Decision:** Use `better-sqlite3` in dev, switch to `pg` with `DATABASE_URL` in production
- **Alternatives:** Use Neon Data API directly (loses TypeORM compatibility)
- **Status:** Accepted

## ADR-3: JSONB for flexible question data
- **Context:** 7 question types with different configuration needs (options, ratings, NPS)
- **Decision:** Store options/settings as JSONB columns. Answer values as JSONB for type flexibility
- **Alternatives:** Separate tables per question type (too complex), EAV pattern (query complexity)
- **Status:** Accepted

## ADR-4: Denormalized response counters
- **Context:** Dashboard needs quick access to response counts
- **Decision:** `responseCount` and `completionRate` stored on Survey entity, updated on each response
- **Alternatives:** COUNT queries on every dashboard load (expensive at scale)
- **Status:** Accepted

## ADR-5: Signals over RxJS for state
- **Context:** Angular 22 introduces signals for local state management
- **Decision:** Use `signal()` for all component state. RxJS only at HTTP boundaries via `toSignal()`
- **Alternatives:** NgRx (too heavy), RxJS BehaviorSubjects (more boilerplate)
- **Status:** Accepted

## ADR-6: Zoneless change detection
- **Context:** Angular 22 supports zoneless change detection
- **Decision:** Use `provideZonelessChangeDetection()` for better performance
- **Alternatives:** Zone.js-based (default, slightly worse performance)
- **Status:** Accepted
