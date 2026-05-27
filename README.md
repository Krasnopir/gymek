# Gymek

Gymek is a private-first AI fitness companion with adaptive training, nutrition logging, and long-term memory.

## Stack

- `apps/web`: TanStack Start + TanStack Query + Zustand + React Hook Form + Tailwind + Supabase client auth
- `apps/api`: Express 5 + Supabase admin client + AI orchestration entrypoints
- `supabase/migrations`: SQL migrations with strict ordering and RLS policies
- `packages/shared`: shared domain types

## Local start

**Нужны 2 процесса:** web (`:3000`) + api (`:8787`).

```bash
cd gymek
pnpm install
pnpm dev
```

Или в двух терминалах:

```bash
pnpm dev:api   # http://localhost:8787/health
pnpm dev:web   # http://localhost:3000
```

Если web пишет `Port 3000 is in use` — открой URL из консоли (например `:3002`) или освободи порт.

Node **20+** (лучше **22** — см. `.nvmrc`).

1. Copy envs:
   - `cp .env.example .env`
   - `cp .env.example apps/api/.env` (or set env in shell)
   - `cp .env.example apps/web/.env`
2. Install deps:
   - `pnpm install`
3. Start app + api:
   - `pnpm dev`

Web runs on `http://localhost:3000`, API on `http://localhost:8787`.

## Supabase migrations

Apply SQL files from `supabase/migrations` in strict filename order:

1. `20260527105000_init_profiles_and_settings.sql`
2. `20260527110000_add_training_domain.sql`
3. `20260527111000_add_nutrition_and_progress.sql`
4. `20260527112000_add_ai_memory.sql`

All domain tables are protected with `RLS` (`auth.uid() = user_id` style policies).

## Google OAuth setup

See [docs/GOOGLE_OAUTH_SUPABASE.md](docs/GOOGLE_OAUTH_SUPABASE.md).

## Deploy on Render

Production target: **Render** (web + api).

- Blueprint: [`render.yaml`](render.yaml)
- Guide: [docs/DEPLOY_RENDER.md](docs/DEPLOY_RENDER.md)

Quick: Render Dashboard → **New Blueprint** → repo `Krasnopir/gymek` → fill secrets → deploy API → deploy web → set `APP_BASE_URL` on API.

## Current status (v1 functional)

- Google auth + onboarding (ru/uk/en/pl)
- Dashboard: вес, калории, белок, сон, чек-ин, вечерний AI summary
- Training: AI план на сегодня, календарь 14 дней, complete/skip + AI план на завтра
- Nutrition: AI оценка еды по тексту, дневной лог
- Progress: вес + график, загрузка progress-фото в Supabase Storage
- API: OpenAI (`gpt-4o-mini`) + fallback шаблоны

### Local run

```bash
pnpm dev
```

### Still optional later

- Render deploy (когда скажешь)
- Nutrition photo vision (сейчас текст)
- Achievements / heatmap polish
