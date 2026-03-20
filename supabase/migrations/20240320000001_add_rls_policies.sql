-- 全ユーザーに対する閲覧許可ポリシーの追加 (開発用)

-- 店舗
DROP POLICY IF EXISTS "Allow public read on stores" ON stores;
CREATE POLICY "Allow public read on stores" ON stores FOR SELECT USING (true);

-- 車両カテゴリ
DROP POLICY IF EXISTS "Allow public read on vehicle_categories" ON vehicle_categories;
CREATE POLICY "Allow public read on vehicle_categories" ON vehicle_categories FOR SELECT USING (true);

-- 車両の追加・更新許可ポリシーの追加

-- 車両への挿入
DROP POLICY IF EXISTS "Allow authenticated insert on vehicles" ON vehicles;
CREATE POLICY "Allow authenticated insert on vehicles" ON vehicles FOR INSERT WITH CHECK (true);

-- 車両の更新
DROP POLICY IF EXISTS "Allow authenticated update on vehicles" ON vehicles;
CREATE POLICY "Allow authenticated update on vehicles" ON vehicles FOR UPDATE USING (true);

-- 車両
DROP POLICY IF EXISTS "Allow public read on vehicles" ON vehicles;
CREATE POLICY "Allow public read on vehicles" ON vehicles FOR SELECT USING (true);

-- 顧客
DROP POLICY IF EXISTS "Allow authenticated read on customers" ON customers;
DROP POLICY IF EXISTS "Allow public read on customers" ON customers;
CREATE POLICY "Allow public read on customers" ON customers FOR SELECT USING (true);

-- 車両ステータス
ALTER TABLE vehicle_statuses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on vehicle_statuses" ON vehicle_statuses;
CREATE POLICY "Allow public read on vehicle_statuses" ON vehicle_statuses FOR SELECT USING (true);

-- プロフィール
DROP POLICY IF EXISTS "Allow users to read their own profile" ON profiles;
CREATE POLICY "Allow users to read their own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- レンタル履歴
DROP POLICY IF EXISTS "Allow authenticated read on rentals" ON rentals;
CREATE POLICY "Allow authenticated read on rentals" ON rentals FOR SELECT USING (auth.role() = 'authenticated');
