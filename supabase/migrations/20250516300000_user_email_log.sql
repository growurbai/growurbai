-- Idempotent transactional email tracking (welcome, trial expired, low credits, etc.)

create table if not exists public.user_email_log (
  user_id uuid not null references auth.users (id) on delete cascade,
  notification_key text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, notification_key)
);

create index if not exists user_email_log_sent_at_idx
  on public.user_email_log (sent_at desc);

alter table public.user_email_log enable row level security;

-- No client policies: service role only (API routes / webhooks).
