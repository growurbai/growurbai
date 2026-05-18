-- Per-user generation credit balance for Brand Kit runs.

create table if not exists public.user_credits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 47 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists user_credits_balance_idx on public.user_credits (balance);

alter table public.user_credits enable row level security;

drop policy if exists "Users can read own credits" on public.user_credits;
create policy "Users can read own credits"
  on public.user_credits
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Writes are performed by the service role in /api/generate only.
