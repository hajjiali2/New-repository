/*
  # Affiliate payout processing (admin)

  RPC that lets an admin mark an affiliate payout as paid and atomically bump the
  affiliate's total_paid. SECURITY DEFINER with is_admin() guard + locked search_path.
*/
CREATE OR REPLACE FUNCTION public.admin_mark_payout_paid(payout_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE p record;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin only';
  END IF;
  SELECT * INTO p FROM public.payouts WHERE id = payout_id;
  IF p.id IS NULL THEN RAISE EXCEPTION 'payout not found'; END IF;
  IF p.status = 'paid' THEN RETURN; END IF;
  UPDATE public.payouts SET status = 'paid' WHERE id = payout_id;
  UPDATE public.affiliates SET total_paid = total_paid + p.amount WHERE id = p.affiliate_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_mark_payout_paid(uuid) TO authenticated;
