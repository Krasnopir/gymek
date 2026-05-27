create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  meal_label text,
  note text,
  calories_kcal int,
  protein_g numeric(6,2),
  carbs_g numeric(6,2),
  fats_g numeric(6,2),
  source text not null default 'manual',
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.nutrition_photo_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nutrition_log_id uuid references public.nutrition_logs(id) on delete set null,
  photo_path text not null,
  ai_model text not null,
  ai_raw_response jsonb not null default '{}'::jsonb,
  accepted boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_date date not null,
  weight_kg numeric(6,2),
  waist_cm numeric(6,2),
  body_fat_percent numeric(5,2),
  note text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, metric_date)
);

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shot_date date not null,
  photo_path text not null,
  posture text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_nutrition_logs_user_date on public.nutrition_logs(user_id, log_date desc);
create index if not exists idx_body_metrics_user_date on public.body_metrics(user_id, metric_date desc);
create index if not exists idx_progress_photos_user_date on public.progress_photos(user_id, shot_date desc);

alter table public.nutrition_logs enable row level security;
alter table public.nutrition_photo_analyses enable row level security;
alter table public.body_metrics enable row level security;
alter table public.progress_photos enable row level security;

drop policy if exists "nutrition_logs_all_own" on public.nutrition_logs;
create policy "nutrition_logs_all_own"
on public.nutrition_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "nutrition_photo_analyses_read_own" on public.nutrition_photo_analyses;
create policy "nutrition_photo_analyses_read_own"
on public.nutrition_photo_analyses
for select
using (auth.uid() = user_id);

drop policy if exists "nutrition_photo_analyses_write_own" on public.nutrition_photo_analyses;
create policy "nutrition_photo_analyses_write_own"
on public.nutrition_photo_analyses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "body_metrics_all_own" on public.body_metrics;
create policy "body_metrics_all_own"
on public.body_metrics
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "progress_photos_all_own" on public.progress_photos;
create policy "progress_photos_all_own"
on public.progress_photos
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values
  ('nutrition-photos', 'nutrition-photos', false),
  ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

drop policy if exists "nutrition_photos_read_own" on storage.objects;
create policy "nutrition_photos_read_own"
on storage.objects
for select
using (
  bucket_id = 'nutrition-photos' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "nutrition_photos_insert_own" on storage.objects;
create policy "nutrition_photos_insert_own"
on storage.objects
for insert
with check (
  bucket_id = 'nutrition-photos' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "nutrition_photos_update_own" on storage.objects;
create policy "nutrition_photos_update_own"
on storage.objects
for update
using (
  bucket_id = 'nutrition-photos' and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'nutrition-photos' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "progress_photos_read_own" on storage.objects;
create policy "progress_photos_read_own"
on storage.objects
for select
using (
  bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "progress_photos_insert_own" on storage.objects;
create policy "progress_photos_insert_own"
on storage.objects
for insert
with check (
  bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "progress_photos_update_own" on storage.objects;
create policy "progress_photos_update_own"
on storage.objects
for update
using (
  bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]
);
