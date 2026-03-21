-- シードデータ

-- 1. 店舗の登録
TRUNCATE TABLE stores CASCADE;
INSERT INTO stores (id, name, address) VALUES
('00000000-0000-0000-0000-000000000001', 'Main Store', '123 Tokyo St.');

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
('Toyota Prius', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 45000),
('Giant Escape R3', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0);

-- 5. 顧客の登録
TRUNCATE TABLE customers CASCADE;
DO $$
DECLARE
    active_id uuid;
BEGIN
    SELECT id INTO active_id FROM customer_statuses WHERE name = 'Active';
    
    INSERT INTO customers (full_name, email, phone, status_id) VALUES
    ('Jane Cooper', 'jane.cooper@example.com', '+81-90-1234-5678', active_id),
    ('Cody Fisher', 'cody.fisher@example.com', '+81-80-9876-5432', active_id),
    ('Esther Howard', 'esther.howard@example.com', '+81-70-1111-2222', active_id),
    ('Cameron Williamson', 'cameron.w@example.com', '+81-80-5555-6666', active_id),
    ('Brooklyn Simmons', 'brooklyn.s@example.com', '+81-90-2222-3333', active_id),
    ('Leslie Alexander', 'leslie.a@example.com', '+81-80-4444-5555', active_id),
    ('Guy Hawkins', 'guy.h@example.com', '+81-70-8888-9999', active_id),
    ('Robert Fox', 'robert.f@example.com', '+81-90-7777-8888', active_id),
    ('Kristin Watson', 'kristin.w@example.com', '+81-80-3333-4444', active_id),
    ('Darlene Robertson', 'darlene.r@example.com', '+81-70-6666-7777', active_id);
END $$;
