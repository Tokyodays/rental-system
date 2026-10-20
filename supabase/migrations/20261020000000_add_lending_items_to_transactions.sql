-- 貸出時の付帯情報を transactions に追加する
--
-- helmet_lent     : ヘルメットを貸したか
-- key_handed_over : 鍵を預けたか
-- deposit         : デポジット。通貨が店舗・客ごとにまちまち（円・ドル等）なので
--                   数値ではなく自由入力のテキストで保持する（例: "5000 JPY", "$50"）

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS helmet_lent     boolean NOT NULL DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS key_handed_over boolean NOT NULL DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS deposit         text;

-- 引数が変わるため旧シグネチャを削除してから作り直す（残すとオーバーロードになる）
DROP FUNCTION IF EXISTS public.complete_lending(uuid, uuid, uuid, uuid, timestamptz, timestamptz, integer, numeric);

-- 貸出: transactions INSERT + vehicles UPDATE + customers UPDATE をアトミックに実行
-- 戻り値: 作成した transaction の id
CREATE OR REPLACE FUNCTION public.complete_lending(
  p_vehicle_id      uuid,
  p_customer_id     uuid,
  p_staff_id        uuid,
  p_store_id        uuid,
  p_start_at        timestamptz,
  p_end_at          timestamptz,
  p_start_mileage   integer,
  p_price           numeric,
  p_helmet_lent     boolean DEFAULT false,
  p_key_handed_over boolean DEFAULT false,
  p_deposit         text    DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_transaction_id    uuid;
  v_lent_status_id    uuid;
  v_renting_status_id uuid;
  v_user_store_id     uuid;
BEGIN
  -- 呼び出しユーザーが p_store_id に所属しているか確認
  v_user_store_id := get_auth_store_id();
  IF v_user_store_id IS DISTINCT FROM p_store_id THEN
    RAISE EXCEPTION 'Access denied: store mismatch';
  END IF;

  SELECT id INTO v_lent_status_id    FROM public.vehicle_statuses  WHERE name = 'Lent';
  SELECT id INTO v_renting_status_id FROM public.customer_statuses WHERE name = 'Renting';

  INSERT INTO public.transactions (
    vehicle_id, customer_id, staff_id, store_id,
    start_at, end_at, start_mileage, price, status,
    helmet_lent, key_handed_over, deposit
  )
  VALUES (
    p_vehicle_id, p_customer_id, p_staff_id, p_store_id,
    p_start_at, p_end_at, p_start_mileage, p_price, 'Active',
    COALESCE(p_helmet_lent, false), COALESCE(p_key_handed_over, false), NULLIF(btrim(p_deposit), '')
  )
  RETURNING id INTO v_transaction_id;

  UPDATE public.vehicles  SET status_id = v_lent_status_id    WHERE id = p_vehicle_id;
  UPDATE public.customers SET status_id = v_renting_status_id WHERE id = p_customer_id;

  RETURN v_transaction_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_lending TO authenticated;
