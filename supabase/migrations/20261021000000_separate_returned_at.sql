-- 返却日時を end_at から分離する
--
-- 問題: complete_return が end_at（返却予定日時）を実際の返却日時で上書きしており、
--       返却後に「いつ返す予定だったか」が失われる。延長機能で予定の変遷を追えない。
-- 解決: 実際の返却日時は returned_at に保存し、end_at は返却予定日時のまま残す。

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS returned_at timestamptz;

-- 既存の返却済みデータ: end_at は上書き済みで実際の返却日時が入っているので returned_at に移す。
-- 本来の返却予定日時は復元できないため、end_at はそのまま残す。
UPDATE public.transactions
SET returned_at = end_at
WHERE status = 'Completed' AND returned_at IS NULL;

-- 返却: transactions UPDATE + vehicles UPDATE + customers UPDATE をアトミックに実行
-- 引数名は互換のため p_end_at のまま（中身は実際の返却日時）
CREATE OR REPLACE FUNCTION public.complete_return(
  p_transaction_id uuid,
  p_end_at         timestamptz,
  p_vehicle_id     uuid,
  p_customer_id    uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_available_status_id uuid;
  v_active_status_id    uuid;
  v_store_id            uuid;
  v_user_store_id       uuid;
BEGIN
  -- 呼び出しユーザーがそのトランザクションの store に所属しているか確認
  SELECT store_id INTO v_store_id FROM public.transactions WHERE id = p_transaction_id;
  v_user_store_id := get_auth_store_id();
  IF v_user_store_id IS DISTINCT FROM v_store_id THEN
    RAISE EXCEPTION 'Access denied: store mismatch';
  END IF;

  SELECT id INTO v_available_status_id FROM public.vehicle_statuses  WHERE name = 'Available';
  SELECT id INTO v_active_status_id    FROM public.customer_statuses WHERE name = 'Active';

  UPDATE public.transactions SET status = 'Completed', returned_at = p_end_at WHERE id = p_transaction_id;
  UPDATE public.vehicles     SET status_id = v_available_status_id            WHERE id = p_vehicle_id;
  UPDATE public.customers    SET status_id = v_active_status_id               WHERE id = p_customer_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_return TO authenticated;
