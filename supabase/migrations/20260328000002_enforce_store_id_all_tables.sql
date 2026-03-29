-- 1. 既存の null データをデフォルト店舗 ID で補完
DO $$
DECLARE
  default_store_id UUID;
BEGIN
  SELECT id INTO default_store_id FROM stores LIMIT 1;
  IF default_store_id IS NOT NULL THEN
    -- customers, vehicles, staff の null を埋める
    UPDATE customers SET store_id = default_store_id WHERE store_id IS NULL;
    UPDATE vehicles SET store_id = default_store_id WHERE store_id IS NULL;
    UPDATE staff SET store_id = default_store_id WHERE store_id IS NULL;
  END IF;
END $$;

-- 2. NOT NULL 制約の追加
ALTER TABLE staff ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE vehicles ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN store_id SET NOT NULL;

-- 3. handle_new_user トリガー関数の更新 (最新仕様への完全対応)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_store_id UUID;
  user_role_id UUID := '00000000-0000-0000-0001-000000000002';
BEGIN
  -- デフォルト店舗の取得
  SELECT id INTO default_store_id FROM public.stores LIMIT 1;
  
  -- staff レコードの作成 (store_id と role_id を確実にセット)
  INSERT INTO public.staff (id, store_id, full_name, role_id)
  VALUES (
    new.id,
    default_store_id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    user_role_id
  )
  ON CONFLICT (id) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    role_id = EXCLUDED.role_id;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
