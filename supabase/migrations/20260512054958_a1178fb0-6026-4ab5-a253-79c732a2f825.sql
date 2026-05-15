-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Designs table (saved canvases / multi-page documents)
create table public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled design',
  canvas_w integer not null default 1080,
  canvas_h integer not null default 1080,
  pages jsonb not null default '[]'::jsonb,
  thumbnail text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index designs_user_id_idx on public.designs(user_id);

alter table public.designs enable row level security;

create policy "Users can view own designs"
  on public.designs for select using (auth.uid() = user_id);

create policy "Users can insert own designs"
  on public.designs for insert with check (auth.uid() = user_id);

create policy "Users can update own designs"
  on public.designs for update using (auth.uid() = user_id);

create policy "Users can delete own designs"
  on public.designs for delete using (auth.uid() = user_id);

-- updated_at triggers
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger designs_set_updated_at
  before update on public.designs
  for each row execute function public.touch_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();