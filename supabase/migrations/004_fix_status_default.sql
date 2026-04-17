-- Migration 004: Fix subscription status default (inactive → active)
-- Apply via: supabase db push OR bezpośrednio w Supabase SQL Editor

ALTER TABLE public.subscriptions
  ALTER COLUMN status SET DEFAULT 'active';

UPDATE public.subscriptions
  SET status = 'active'
  WHERE tier = 'free';
