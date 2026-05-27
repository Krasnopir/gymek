create extension if not exists "pgcrypto";

create type public.locale_code as enum ('ru', 'uk', 'en', 'pl');
create type public.ai_tone as enum ('goblin', 'bro', 'chill', 'science');
create type public.workout_mode as enum ('recovery', 'balanced', 'beast');
create type public.workout_compression as enum ('normal', 'compressed', 'ultra_compressed');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  date_of_birth date,
  sex text,
  height_cm numeric(5,2),
  start_weight_kg numeric(6,2),
  locale public.locale_code not null default 'ru',
  ai_tone public.ai_tone not null default 'goblin',
  training_goal text not null default 'recomposition',
  training_level text not null default 'returning',
  preferred_workout_days int not null default 4,
  preferred_workout_minutes int not null default 60,
  default_workout_mode public.workout_mode not null default 'balanced',
  nutrition_style text not null default 'balanced',
  injuries jsonb not null default '{}'::jsonb,
  equipment jsonb not null default '[]'::jsonb,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
