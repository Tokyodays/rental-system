-- 貸出の延長
--
-- 延長 1 回ごとに transaction_extensions に記録し、transactions.end_at を新しい返却予定日時に更新する。
-- 延長料金は毎回手入力・返却時にまとめて支払う運用のため、支払い状態は持たない。
-- 書き込みは extend_rental RPC 経由のみ（テーブルには SELECT ポリシーだけを付ける）。

CREATE TABLE IF NOT EXISTS public.transaction_extensions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id   uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  -- RLS を単純にするため transactions.store_id を複製して持つ
  store_id         uuid NOT NULL REFERENCES public.stores(id),
  staff_id         uuid REFERENCES public.staff(id),
  previous_end_at  timestamptz NOT NULL,
  new_end_at       timestamptz NOT NULL,
  additional_price numeric NOT NULL DEFAULT 0 CHECK (additional_price >= 0),
  note             text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transaction_extensions_transaction_id_idx
  ON public.transaction_extensions (transaction_id);

ALTER TABLE public.transaction_extensions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view extensions in their store" ON public.transaction_extensions;
CREATE POLICY "Staff can view extensions in their store"
  ON public.transaction_extensions
  FOR SELECT
  USING (store_id = get_auth_store_id());

-- 延長: transaction_extensions INSERT + transactions.end_at UPDATE をアトミックに実行
-- 戻り値: 作成した extension の id
CREATE OR REPLACE FUNCTION public.extend_rental(
  p_transaction_id   uuid,
  p_new_end_at       timestamptz,
  p_additional_price numeric,
  p_note             text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_extension_id uuid;
  v_store_id     uuid;
  v_status       text;
  v_end_at       timestamptz;
BEGIN
  -- 同時に延長されても previous_end_at がずれないよう行ロックを取る
  SELECT store_id, status, end_at INTO v_store_id, v_status, v_end_at
  FROM public.transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  -- 呼び出しユーザーがそのトランザクションの store に所属しているか確認
  IF get_auth_store_id() IS DISTINCT FROM v_store_id THEN
    RAISE EXCEPTION 'Access denied: store mismatch';
  END IF;

  IF v_status IS DISTINCT FROM 'Active' THEN
    RAISE EXCEPTION 'Only active rentals can be extended';
  END IF;

  IF p_new_end_at IS NULL OR p_new_end_at <= v_end_at THEN
    RAISE EXCEPTION 'New return date must be later than the current one';
  END IF;

  IF p_additional_price IS NULL OR p_additional_price < 0 THEN
    RAISE EXCEPTION 'Additional price must be 0 or more';
  END IF;

  INSERT INTO public.transaction_extensions (
    transaction_id, store_id, staff_id,
    previous_end_at, new_end_at, additional_price, note
  )
  VALUES (
    p_transaction_id, v_store_id, auth.uid(),
    v_end_at, p_new_end_at, p_additional_price, NULLIF(btrim(p_note), '')
  )
  RETURNING id INTO v_extension_id;

  UPDATE public.transactions SET end_at = p_new_end_at WHERE id = p_transaction_id;

  RETURN v_extension_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.extend_rental TO authenticated;
