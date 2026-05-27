# Gymek

Gymek is a private-first AI fitness companion with adaptive training, nutrition logging, and long-term memory.

## Stack

- `apps/web`: TanStack Start + TanStack Query + Zustand + React Hook Form + Tailwind + Supabase client auth
- `apps/api`: Express 5 + Supabase admin client + AI orchestration entrypoints
- `supabase/migrations`: SQL migrations with strict ordering and RLS policies
- `packages/shared`: shared domain types

## Local start

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

## Hosting note

GitHub Pages hosts **static files only**. It cannot run Express API or TanStack Start SSR/Nitro server.
Recommended split:
- Web static build → GitHub Pages (or Cloudflare Pages)
- API → Railway / Render / Fly.io / Cloudflare Workers

## Current status

- Bootstrap complete for monorepo, auth baseline, and onboarding persistence.
- Next implementation pass: calendar UX, workout planner flows, nutrition photo analysis pipeline, AI memory jobs.
