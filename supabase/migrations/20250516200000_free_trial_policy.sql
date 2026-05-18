-- Free trial enforcement (application layer)
-- Trial window: 7 calendar days from auth.users.created_at
-- Bypass: subscriptions.plan in ('growth_pro', 'agency') with status active/trialing/past_due
-- Enforced in POST /api/generate via lib/free-trial.ts

comment on table public.subscriptions is
  'Stripe subscription mirror. Paid plans bypass the 7-day auth.users.created_at free trial.';
