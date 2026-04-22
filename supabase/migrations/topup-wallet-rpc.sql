-- Funkcja RPC do atomowego doładowania portfela PAYG.
-- Wykonaj w Supabase SQL Editor lub dodaj do migracji.
--
-- Gwarancje:
--   • INSERT i UPDATE wykonują się w jednej transakcji — albo oba przejdą albo żadne
--   • ON CONFLICT addytywnie dodaje strony (nie nadpisuje)
--   • audit log (wallet_transactions) zawsze spójny z saldem (page_wallets)

CREATE OR REPLACE FUNCTION topup_wallet_with_log(
  p_user_id           uuid,
  p_pages             int,
  p_stripe_payment_id text
)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  new_balance int;
BEGIN
  -- Upsert portfela: dodaj strony addytywnie
  INSERT INTO page_wallets (user_id, balance)
  VALUES (p_user_id, p_pages)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance    = page_wallets.balance + EXCLUDED.balance,
    updated_at = now()
  RETURNING balance INTO new_balance;

  -- Zapisz transakcję w audit logu
  INSERT INTO wallet_transactions
    (user_id, pages_delta, balance_after, reason, stripe_payment_id)
  VALUES
    (p_user_id, p_pages, new_balance, 'topup', p_stripe_payment_id);

  RETURN new_balance;
END;
$$;
