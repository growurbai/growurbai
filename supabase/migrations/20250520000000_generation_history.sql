-- Per-user generated asset history for the dashboard gallery.

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  prompt text,
  aspect_ratio text,
  created_at timestamptz not null default now()
);

create index if not exists generations_user_created_at_idx
  on public.generations (user_id, created_at desc);

create index if not exists generations_aspect_ratio_idx
  on public.generations (aspect_ratio);

alter table public.generations enable row level security;

drop policy if exists "Users can read own generations" on public.generations;
create policy "Users can read own generations"
  on public.generations
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Writes are performed by trusted server routes after successful generation.
