-- 車両の追加・更新許可ポリシーの追加

-- 車両への挿入
DROP POLICY IF EXISTS "Allow authenticated insert on vehicles" ON vehicles;
CREATE POLICY "Allow authenticated insert on vehicles" ON vehicles FOR INSERT WITH CHECK (true);

-- 車両の更新
DROP POLICY IF EXISTS "Allow authenticated update on vehicles" ON vehicles;
CREATE POLICY "Allow authenticated update on vehicles" ON vehicles FOR UPDATE USING (true);
