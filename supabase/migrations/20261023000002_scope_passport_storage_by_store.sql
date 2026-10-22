-- 顧客パスポート画像を店舗ごとに分離する
-- 従来は認証済みなら全店舗の画像を読み書きできたため、パス先頭のフォルダ（店舗ID）で判定する
-- 保存先: customer-passports/{store_id}/{customer_id}.jpg

DROP POLICY IF EXISTS "Allow authenticated read on customer-passports" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload to customer-passports" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on customer-passports" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from customer-passports" ON storage.objects;

DROP POLICY IF EXISTS "Staff can read passports in their store" ON storage.objects;
CREATE POLICY "Staff can read passports in their store" ON storage.objects FOR SELECT
  USING (bucket_id = 'customer-passports' AND (storage.foldername(name))[1] = public.get_auth_store_id()::text);

DROP POLICY IF EXISTS "Staff can upload passports in their store" ON storage.objects;
CREATE POLICY "Staff can upload passports in their store" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'customer-passports' AND (storage.foldername(name))[1] = public.get_auth_store_id()::text);

DROP POLICY IF EXISTS "Staff can update passports in their store" ON storage.objects;
CREATE POLICY "Staff can update passports in their store" ON storage.objects FOR UPDATE
  USING (bucket_id = 'customer-passports' AND (storage.foldername(name))[1] = public.get_auth_store_id()::text)
  WITH CHECK (bucket_id = 'customer-passports' AND (storage.foldername(name))[1] = public.get_auth_store_id()::text);

DROP POLICY IF EXISTS "Staff can delete passports in their store" ON storage.objects;
CREATE POLICY "Staff can delete passports in their store" ON storage.objects FOR DELETE
  USING (bucket_id = 'customer-passports' AND (storage.foldername(name))[1] = public.get_auth_store_id()::text);
