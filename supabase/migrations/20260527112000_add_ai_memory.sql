create table if not exists public.ai_summaries_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  summary_date date not null,
  summary_text text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, summary_date)
);

create table if not exists public.ai_summaries_weekly (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  summary_text text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, week_start)
);

create table if not exists public.ai_memory_facts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fact_type text not null,
  fact_text text not null,
  relevance_score numeric(5,2) not null default 0,
  source_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_ai_daily_user_date on public.ai_summaries_daily(user_id, summary_date desc);
create index if not exists idx_ai_weekly_user_date on public.ai_summaries_weekly(user_id, week_start desc);
create index if not exists idx_ai_memory_user_relevance on public.ai_memory_facts(user_id, relevance_score desc, source_date desc);

alter table public.ai_summaries_daily enable row level security;
alter table public.ai_summaries_weekly enable row level security;
alter table public.ai_memory_facts enable row level security;

drop policy if exists "ai_summaries_daily_all_own" on public.ai_summaries_daily;
create policy "ai_summaries_daily_all_own"
on public.ai_summaries_daily
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "ai_summaries_weekly_all_own" on public.ai_summaries_weekly;
create policy "ai_summaries_weekly_all_own"
on public.ai_summaries_weekly
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "ai_memory_facts_all_own" on public.ai_memory_facts;
create policy "ai_memory_facts_all_own"
on public.ai_memory_facts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
