create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  location text,
  target_role text,
  skills text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text not null,
  work_type text not null,
  salary_range text,
  fit_score integer default 0,
  summary text not null,
  required_skills text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  level text not null,
  duration text not null,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  outcome text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  role text not null,
  company text not null,
  status text not null check (status in ('Applied', 'Screening', 'Interview', 'Rejected', 'Offer')),
  next_step text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.learning_paths enable row level security;
alter table public.applications enable row level security;

create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can view own learning path"
on public.learning_paths
for select
using (auth.uid() = profile_id);

create policy "Users can manage own learning path"
on public.learning_paths
for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

create policy "Users can view own applications"
on public.applications
for select
using (auth.uid() = profile_id);

create policy "Users can manage own applications"
on public.applications
for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

create policy "Jobs are viewable by everyone"
on public.jobs
for select
using (true);
