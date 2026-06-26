-- シードデータ

-- 1. 店舗の登録
INSERT INTO stores (id, name, address, currency_id)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Main Store',
  '123 Tokyo St.',
  c.id
FROM currency c WHERE c.currency_text = 'THB'
ON CONFLICT (id) DO NOTHING;

-- 2. 車両カテゴリの登録
TRUNCATE TABLE vehicle_categories CASCADE;
INSERT INTO vehicle_categories (id, name, icon) VALUES
('00000000-0000-0000-0000-000000000001', 'Bike', 'i-lucide-bike'),
('00000000-0000-0000-0000-000000000002', 'Car', 'i-lucide-car'),
('00000000-0000-0000-0000-000000000003', 'Bicycle', 'i-lucide-footprints');

-- 3. 車両ステータスの登録
TRUNCATE TABLE vehicle_statuses CASCADE;
INSERT INTO vehicle_statuses (id, name, color) VALUES
('00000000-0000-0000-0000-000000000001', 'Available', 'success'),
('00000000-0000-0000-0000-000000000002', 'Lent', 'primary'),
('00000000-0000-0000-0000-000000000003', 'Unavailable', 'error'),
('00000000-0000-0000-0000-000000000004', 'Reserved', 'warning');

-- 4. 車両の登録
TRUNCATE TABLE vehicles CASCADE;
INSERT INTO vehicles (name, category_id, store_id, status_id, last_mileage) VALUES
('Honda Super Cub', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1200),
('Yamaha Vino', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 850),
('Toyota Prius', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 45000),
('Giant Escape R3', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0),
('Nissan Note', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 12000),
('Toyota Yaris', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 8000),
('Honda Fit', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 15000),
('Suzuki Swift', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 5000),
('Mazda 2', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 22000),
('Subaru Impreza', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 31000),
('Yamaha PCX', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 3000),
('Honda Lead', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 5000),
('Suzuki Address', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 8000),
('Trek FX 3', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0),
('Bianchi Roma', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0),
('Specialized Sirrus', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0),
('Bridgestone TB1', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0),
('Panasonic Gyutto', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0),
('Yamaha PAS', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0),
('Toyota Aqua', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 42000);

-- 5. 顧客の登録
TRUNCATE TABLE customers CASCADE;
DO $$
DECLARE
    active_id uuid;
    default_store_id uuid;
BEGIN
    SELECT id INTO active_id FROM customer_statuses WHERE name = 'Active';
    SELECT id INTO default_store_id FROM stores LIMIT 1;
    
    INSERT INTO customers (full_name, email, phone, status_id, store_id) VALUES
    ('Jane Cooper', 'jane.cooper@example.com', '+81-90-1234-5678', active_id, default_store_id),
    ('Cody Fisher', 'cody.fisher@example.com', '+81-80-9876-5432', active_id, default_store_id),
    ('Esther Howard', 'esther.howard@example.com', '+81-70-1111-2222', active_id, default_store_id),
    ('Cameron Williamson', 'cameron.w@example.com', '+81-80-5555-6666', active_id, default_store_id),
    ('Brooklyn Simmons', 'brooklyn.s@example.com', '+81-90-2222-3333', active_id, default_store_id),
    ('Leslie Alexander', 'leslie.a@example.com', '+81-80-4444-5555', active_id, default_store_id),
    ('Guy Hawkins', 'guy.h@example.com', '+81-70-8888-9999', active_id, default_store_id),
    ('Robert Fox', 'robert.f@example.com', '+81-90-7777-8888', active_id, default_store_id),
    ('Kristin Watson', 'kristin.w@example.com', '+81-80-3333-4444', active_id, default_store_id),
    ('Darlene Robertson', 'darlene.r@example.com', '+81-70-6666-7777', active_id, default_store_id),
    ('Taro Yamada', 'taro.yamada@example.com', '+81-90-1111-1111', active_id, default_store_id),
    ('Hanako Sato', 'hanako.sato@example.com', '+81-80-2222-2222', active_id, default_store_id),
    ('Kenji Suzuki', 'kenji.suzuki@example.com', '+81-70-3333-3333', active_id, default_store_id),
    ('Yumi Takahashi', 'yumi.takahashi@example.com', '+81-90-4444-4444', active_id, default_store_id),
    ('Takeshi Tanaka', 'takeshi.tanaka@example.com', '+81-80-5555-5555', active_id, default_store_id),
    ('Kumiko Ito', 'kumiko.ito@example.com', '+81-70-6666-6666', active_id, default_store_id),
    ('Hiroshi Watanabe', 'hiroshi.watanabe@example.com', '+81-90-7777-7777', active_id, default_store_id),
    ('Sakura Kobayashi', 'sakura.kobayashi@example.com', '+81-80-8888-8888', active_id, default_store_id),
    ('Ryo Kato', 'ryo.kato@example.com', '+81-70-9999-9999', active_id, default_store_id),
    ('Yuki Yoshida', 'yuki.yoshida@example.com', '+81-90-0000-0000', active_id, default_store_id);
END $$;

-- 6. スタッフの同期 (auth.users と staff を紐づける)
DO $$
DECLARE
  u record;
  default_store_id UUID;
  user_role_id UUID;
BEGIN
  SELECT id INTO default_store_id FROM public.stores LIMIT 1;
  SELECT id INTO user_role_id FROM public.staff_roles WHERE name = 'user';

  FOR u IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    INSERT INTO public.staff (id, store_id, username, role_id)
    VALUES (
      u.id,
      default_store_id,
      LOWER(COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1))),
      user_role_id
    )
    ON CONFLICT (id) DO UPDATE SET
      store_id = EXCLUDED.store_id;
  END LOOP;
END $$;

-- 7. テストユーザーのロール設定
UPDATE public.staff SET role_id = '00000000-0000-0000-0001-000000000000' WHERE username = 'admin';
UPDATE public.staff SET role_id = '00000000-0000-0000-0001-000000000001' WHERE username = 'branchadmin';
