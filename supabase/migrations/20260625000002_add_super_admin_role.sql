-- Phase 1: super_admin ロール追加と @admin ユーザーのロール変更
-- super_admin: オーナー（店舗管理専用）
-- admin: ブランチ管理者（レンタル業務 + スタッフ管理）

-- 1-1: staff_roles に super_admin を追加
INSERT INTO staff_roles (id, name)
VALUES ('00000000-0000-0000-0001-000000000000', 'super_admin')
ON CONFLICT (id) DO NOTHING;

-- 1-2: @admin ユーザーを super_admin に変更
UPDATE staff
SET role_id = '00000000-0000-0000-0001-000000000000'
WHERE username = 'admin';
