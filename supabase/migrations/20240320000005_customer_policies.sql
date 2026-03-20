-- 顧客データの操作許可ポリシー

-- 顧客の作成
DROP POLICY IF EXISTS "Allow authenticated insert on customers" ON customers;
DROP POLICY IF EXISTS "Allow public insert on customers" ON customers;
CREATE POLICY "Allow public insert on customers" ON customers FOR INSERT WITH CHECK (true);

-- 顧客の更新
DROP POLICY IF EXISTS "Allow authenticated update on customers" ON customers;
CREATE POLICY "Allow authenticated update on customers" ON customers FOR UPDATE USING (true);
