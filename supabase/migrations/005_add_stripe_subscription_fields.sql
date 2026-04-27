-- Migration 005: Add stripe_subscription_id, period_start, period_end
-- Columns referenced by webhook handler but missing from schema.
-- Apply via: Supabase SQL Editor or supabase db push

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS period_start            timestamptz,
  ADD COLUMN IF NOT EXISTS period_end              timestamptz;

CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx
  ON public.subscriptions (stripe_subscription_id);
