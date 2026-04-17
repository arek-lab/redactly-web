-- Migration 003: Stripe customer ID + PDF quota columns
-- Apply via: supabase db push OR bezpośrednio w Supabase SQL Editor

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS quota_total         integer,
  ADD COLUMN IF NOT EXISTS quota_used          integer NOT NULL DEFAULT 0;

-- Indeks do szybkiego wyszukiwania usera po stripe_customer_id (webhooks)
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx
  ON public.subscriptions (stripe_customer_id);
