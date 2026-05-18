-- =============================================================================
-- GrowUrb AI — Combined Supabase setup (run once in SQL Editor)
-- Order: subscriptions → user_credits → trial policy documentation
-- Requires: Supabase Auth enabled (auth.users must exist)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SUBSCRIPTIONS (Stripe mirror — paid plans bypass 7-day account trial)
-- -----------------------------------------------------------------------------

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text not null default 'free'
    check (plan in ('free', 'trial', 'growth_pro', 'agency')),
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id);

create index if not exists subscriptions_status_idx
  on public.subscriptions (status);

create index if not exists subscriptions_plan_status_idx
  on public.subscriptions (plan, status);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can read own subscription" on public.subscriptions;
create policy "Users can read own subscription"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Inserts/updates: service role only (Stripe webhooks + /api/checkout)

-- -----------------------------------------------------------------------------
-- 2. USER CREDITS (Brand Kit generation balance per user)
-- -----------------------------------------------------------------------------

create table if not exists public.user_credits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 47 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists user_credits_balance_idx
  on public.user_credits (balance);

alter table public.user_credits enable row level security;

drop policy if exists "Users can read own credits" on public.user_credits;
create policy "Users can read own credits"
  on public.user_credits
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Writes: service role only (/api/generate deducts credits)

-- -----------------------------------------------------------------------------
-- 3. SEVEN-DAY FREE TRIAL POLICY (enforced in app + optional SQL helpers)
--
-- Trial window: 7 days from auth.users.created_at
-- Expired when: (now() - created_at) > 7 days
-- Bypass when: subscriptions.plan IN ('growth_pro','agency')
--              AND status IN ('active','trialing','past_due')
-- API gate: POST /api/generate → 403 TRIAL_EXPIRED (lib/free-trial.ts)
-- -----------------------------------------------------------------------------

comment on table public.subscriptions is
  'Stripe subscription mirror. Paid plans bypass the 7-day auth.users.created_at free trial.';

comment on table public.user_credits is
  'Per-user Brand Kit generation credits. Default balance 47 for new rows.';

-- Optional: SQL helpers for dashboards / admin (app uses lib/free-trial.ts)
create or replace function public.has_active_paid_subscription(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subscriptions s
    where s.user_id = p_user_id
      and s.plan in ('growth_pro', 'agency')
      and s.status in ('active', 'trialing', 'past_due')
  );
$$;

create or replace function public.account_trial_expired(p_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v_created_at timestamptz;
begin
  if public.has_active_paid_subscription(p_user_id) then
    return false;
  end if;

  select u.created_at into v_created_at
  from auth.users u
  where u.id = p_user_id;

  if v_created_at is null then
    return false;
  end if;

  return now() > v_created_at + interval '7 days';
end;
$$;

create or replace function public.account_trial_days_left(p_user_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v_created_at timestamptz;
  v_remaining interval;
begin
  if public.has_active_paid_subscription(p_user_id) then
    return 0;
  end if;

  select u.created_at into v_created_at
  from auth.users u
  where u.id = p_user_id;

  if v_created_at is null then
    return 0;
  end if;

  v_remaining := (v_created_at + interval '7 days') - now();
  if v_remaining <= interval '0' then
    return 0;
  end if;

  return ceil(extract(epoch from v_remaining) / 86400.0)::integer;
end;
$$;

revoke all on function public.has_active_paid_subscription(uuid) from public;
revoke all on function public.account_trial_expired(uuid) from public;
revoke all on function public.account_trial_days_left(uuid) from public;

grant execute on function public.has_active_paid_subscription(uuid) to authenticated;
grant execute on function public.account_trial_expired(uuid) to authenticated;
grant execute on function public.account_trial_days_left(uuid) to authenticated;

grant execute on function public.has_active_paid_subscription(uuid) to service_role;
grant execute on function public.account_trial_expired(uuid) to service_role;
grant execute on function public.account_trial_days_left(uuid) to service_role;
