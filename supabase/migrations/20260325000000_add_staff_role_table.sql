-- staff_role テーブルの作成
CREATE TABLE IF NOT EXISTS staff_roles (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS を有効化
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;

-- 読み取りは認証済みユーザー全員に許可
CREATE POLICY "staff_roles_select" ON staff_roles
  FOR SELECT TO authenticated USING (true);

-- デフォルトロールの挿入
INSERT INTO staff_roles (id, name) VALUES
  ('00000000-0000-0000-0001-000000000001', 'admin'),
  ('00000000-0000-0000-0001-000000000002', 'user')
ON CONFLICT (name) DO NOTHING;

-- staff テーブルの role カラムを TEXT → UUID (FK) に変更
-- 1. 新しいカラムを追加
ALTER TABLE staff ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES staff_roles(id);

-- 2. 既存データを移行（現在の role TEXT 値 → staff_roles の id へ）
--    'admin' → admin ロールの id
--    それ以外 → user ロールの id
UPDATE staff
SET role_id = CASE
  WHEN role = 'admin' THEN '00000000-0000-0000-0001-000000000001'::UUID
  ELSE                     '00000000-0000-0000-0001-000000000002'::UUID
END
WHERE role_id IS NULL;

-- 3. role_id を NOT NULL にする
ALTER TABLE staff ALTER COLUMN role_id SET NOT NULL;

-- 4. 旧 role TEXT カラムを削除
ALTER TABLE staff DROP COLUMN IF EXISTS role;
