-- 顧客データの更新許可ポリシーをパブリックに変更
DROP POLICY IF EXISTS "Allow authenticated update on customers" ON customers;
DROP POLICY IF EXISTS "Allow public update on customers" ON customers;
CREATE POLICY "Allow public update on customers" ON customers FOR UPDATE USING (true);
