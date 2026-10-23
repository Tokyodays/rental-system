-- 顧客パスポート画像の上書き（upsert）を許可する
-- 編集画面で写真を差し替えると既存オブジェクトの UPDATE になるが、UPDATE ポリシーがなく RLS で拒否されていた
DROP POLICY IF EXISTS "Allow authenticated update on customer-passports" ON storage.objects;
CREATE POLICY "Allow authenticated update on customer-passports" ON storage.objects FOR UPDATE
  USING (bucket_id = 'customer-passports' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'customer-passports' AND auth.role() = 'authenticated');
