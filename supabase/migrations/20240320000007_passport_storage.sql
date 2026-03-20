-- 顧客パスポート画像用ストレージバケットの作成
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-passports', 'customer-passports', false) ON CONFLICT DO NOTHING;

-- 閲覧許可（認証済みスタッフのみ）
DROP POLICY IF EXISTS "Allow authenticated read on customer-passports" ON storage.objects;
CREATE POLICY "Allow authenticated read on customer-passports" ON storage.objects FOR SELECT USING (bucket_id = 'customer-passports' AND auth.role() = 'authenticated');

-- アップロード許可（認証済みスタッフのみ）
DROP POLICY IF EXISTS "Allow authenticated upload to customer-passports" ON storage.objects;
CREATE POLICY "Allow authenticated upload to customer-passports" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'customer-passports' AND auth.role() = 'authenticated');

-- 削除許可（認証済みスタッフのみ）
DROP POLICY IF EXISTS "Allow authenticated delete from customer-passports" ON storage.objects;
CREATE POLICY "Allow authenticated delete from customer-passports" ON storage.objects FOR DELETE USING (bucket_id = 'customer-passports' AND auth.role() = 'authenticated');
