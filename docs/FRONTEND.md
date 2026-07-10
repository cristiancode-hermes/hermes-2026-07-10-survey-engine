# Frontend Architecture

## Signal Architecture

Angular 22 with signal-first, zoneless change detection.

### State Management Pattern

All components follow the same pattern:
```typescript
const data = signal<T | null>(null);
const loading = signal(true);
const error = signal<string | null>(null);
```

Template:
```html
@if (loading()) { <skeleton /> }
@else if (error()) { <error-message /> }
@else if (!data()) { <empty-state /> }
@else { <content /> }
```

### Key Pages

| Page | Route | State | Notes |
|------|-------|-------|-------|
| Login | /auth/login | email, password, loading, error | Centered card form |
| Register | /auth/register | name, email, password, confirm, loading, error | Auto-creates org |
| Dashboard | /dashboard | surveys, loading, error, activeTab, search | Grid + list toggle |
| Survey Builder | /surveys/:id/edit | survey, questions, selectedQuestion, saveStatus | 3-panel layout |
| Survey Results | /surveys/:id/results | results, kpis, loading, error | KPI cards + charts |
| Public Survey | /survey/:slug | survey, answers, submitting, submitted, closed | No auth |
| Settings | /settings | name, email, currentPassword, newPassword | Profile + password |

### Lazy Loading

Each page uses `loadComponent` for automatic code splitting:
```typescript
{ path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component') }
```
