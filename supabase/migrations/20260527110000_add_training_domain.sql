create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  focus text not null,
  mode public.workout_mode not null default 'balanced',
  compression public.workout_compression not null default 'normal',
  status text not null default 'planned',
  ai_note text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, plan_date)
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid not null references public.workout_plans(id) on delete cascade,
  sort_order int not null,
  exercise_name text not null,
  target_muscle text,
  target_sets int,
  target_reps text,
  target_weight_kg numeric(6,2),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_plan_id uuid references public.workout_plans(id) on delete set null,
  session_date date not null,
  status text not null check (status in ('completed', 'skipped', 'partial')),
  duration_minutes int,
  effort_score int check (effort_score between 1 and 10),
  note text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  workout_exercise_id uuid references public.workout_exercises(id) on delete set null,
  set_order int not null,
  reps int,
  weight_kg numeric(6,2),
  rir int,
  is_warmup boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_date date not null,
  recommendation_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null,
  mood_score int check (mood_score between 1 and 10),
  stress_score int check (stress_score between 1 and 10),
  sleep_hours numeric(4,2),
  soreness jsonb not null default '{}'::jsonb,
  workload_state text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, checkin_date)
);

drop trigger if exists trg_workout_plans_updated_at on public.workout_plans;
create trigger trg_workout_plans_updated_at
before update on public.workout_plans
for each row execute procedure public.set_updated_at();

create index if not exists idx_workout_plans_user_date on public.workout_plans(user_id, plan_date desc);
create index if not exists idx_workout_sessions_user_date on public.workout_sessions(user_id, session_date desc);
create index if not exists idx_daily_checkins_user_date on public.daily_checkins(user_id, checkin_date desc);

alter table public.workout_plans enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.ai_recommendations enable row level security;
alter table public.daily_checkins enable row level security;

drop policy if exists "workout_plans_all_own" on public.workout_plans;
create policy "workout_plans_all_own"
on public.workout_plans
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "workout_exercises_read_own" on public.workout_exercises;
create policy "workout_exercises_read_own"
on public.workout_exercises
for select
using (
  exists (
    select 1 from public.workout_plans wp
    where wp.id = workout_plan_id and wp.user_id = auth.uid()
  )
);

drop policy if exists "workout_exercises_write_own" on public.workout_exercises;
create policy "workout_exercises_write_own"
on public.workout_exercises
for all
using (
  exists (
    select 1 from public.workout_plans wp
    where wp.id = workout_plan_id and wp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workout_plans wp
    where wp.id = workout_plan_id and wp.user_id = auth.uid()
  )
);

drop policy if exists "workout_sessions_all_own" on public.workout_sessions;
create policy "workout_sessions_all_own"
on public.workout_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "workout_sets_read_own" on public.workout_sets;
create policy "workout_sets_read_own"
on public.workout_sets
for select
using (
  exists (
    select 1 from public.workout_sessions ws
    where ws.id = workout_session_id and ws.user_id = auth.uid()
  )
);

drop policy if exists "workout_sets_write_own" on public.workout_sets;
create policy "workout_sets_write_own"
on public.workout_sets
for all
using (
  exists (
    select 1 from public.workout_sessions ws
    where ws.id = workout_session_id and ws.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workout_sessions ws
    where ws.id = workout_session_id and ws.user_id = auth.uid()
  )
);

drop policy if exists "ai_recommendations_all_own" on public.ai_recommendations;
create policy "ai_recommendations_all_own"
on public.ai_recommendations
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "daily_checkins_all_own" on public.daily_checkins;
create policy "daily_checkins_all_own"
on public.daily_checkins
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
