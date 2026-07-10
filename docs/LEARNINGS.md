# Learnings — 2026-07-10 Survey Engine

1. **TypeORM 1.0 `save()` returns array type** — Single-entity save returns `DeepPartial<T>[] | DeepPartial<T>`, causing TS errors. Fix with `as unknown as T` cast. This is a known TypeORM 1.0 issue with TypeScript 5.7+ decorators.

2. **`null` assignment to nullable entity fields** — When creating entities with `create()`, passing `null` for nullable fields causes TS2769 overload errors. Use `undefined` instead of `null` for optional fields in `create()` calls.

3. **Angular 22 template type checking is strict** — Property access on `Observable<T>` in templates causes TS2339. Services returning Observables need `firstValueFrom()` usage in components, or use `toSignal()` to bridge.

4. **Parallel subagent at 600s produces ~85% correct code** — Both backend and frontend subagents timed out. Most common issues: import paths (wrong relative depth), `new Service()` instead of `inject()`, missing pipe imports (DatePipe), and template type mismatches.

5. **Seed module with hardcoded UUIDs works well** — Using stable UUID strings like `'svy-nps'`, `'q-nps-1'` makes seed data predictable for development and testing.

6. **Backend builds faster than frontend** — NestJS SWC build takes ~3s. Angular build takes ~20-30s. Time budget should account for this asymmetry.

7. **npx ng build blocked by security scanner** — Use `node_modules/.bin/ng build` instead of `npx ng build` to avoid security scanner false positives.
