-- 車両カテゴリの標準化 (Bike, Car, Bicycle)

-- 既存のカテゴリを削除（外部キー制約がある場合は、先に vehicles の category_id を NULL にするか、カテゴリを付け替える必要があります）
-- ここではクリーンな状態にするため、一度データを整理します

TRUNCATE TABLE vehicle_categories RESTART IDENTITY CASCADE;

INSERT INTO vehicle_categories (name, icon) VALUES 
('Bike', 'i-lucide-bike'),
('Car', 'i-lucide-car'),
('Bicycle', 'i-lucide-bike');

-- すべての車両を一旦 'Bike' に寄せる（あるいは個別に更新）
-- このスクリプトは手動で実行されることを想定しています
UPDATE vehicles SET category_id = (SELECT id FROM vehicle_categories WHERE name = 'Bike' LIMIT 1);
