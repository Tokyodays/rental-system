-- 車両画像用ストレージバケットの作成とポリシー設定

INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-images', 'vehicle-images', true) ON CONFLICT DO NOTHING;

-- 閲覧許可
DROP POLICY IF EXISTS "Allow public read on vehicle-images" ON storage.objects;
CREATE POLICY "Allow public read on vehicle-images" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');

-- アップロード許可
DROP POLICY IF EXISTS "Allow authenticated upload to vehicle-images" ON storage.objects;
CREATE POLICY "Allow authenticated upload to vehicle-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');

-- 削除許可
DROP POLICY IF EXISTS "Allow authenticated delete from vehicle-images" ON storage.objects;
CREATE POLICY "Allow authenticated delete from vehicle-images" ON storage.objects FOR DELETE USING (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');
