alter table public.workout_exercises
  add column if not exists exercise_description text,
  add column if not exists coaching_tip text;

alter table public.workout_sessions
  add column if not exists skip_reason_code text;

create table if not exists public.workout_exercise_logs (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  completed boolean not null default false,
  planned_weight_kg numeric(6,2),
  actual_weight_kg numeric(6,2),
  planned_reps text,
  actual_reps text,
  planned_sets int,
  actual_sets int,
  note text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (workout_session_id, workout_exercise_id)
);

create index if not exists idx_workout_exercise_logs_session
  on public.workout_exercise_logs(workout_session_id);

alter table public.workout_exercise_logs enable row level security;

drop policy if exists "workout_exercise_logs_read_own" on public.workout_exercise_logs;
create policy "workout_exercise_logs_read_own"
on public.workout_exercise_logs
for select
using (
  exists (
    select 1 from public.workout_sessions ws
    where ws.id = workout_session_id and ws.user_id = auth.uid()
  )
);

drop policy if exists "workout_exercise_logs_write_own" on public.workout_exercise_logs;
create policy "workout_exercise_logs_write_own"
on public.workout_exercise_logs
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
