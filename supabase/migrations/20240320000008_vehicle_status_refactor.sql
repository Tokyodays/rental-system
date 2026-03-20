-- 車両ステータステーブルの作成と移行用マイグレーション
CREATE TABLE IF NOT EXISTS vehicle_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 固定のステータス ID で初期データを挿入
INSERT INTO vehicle_statuses (id, name, color) VALUES
('00000000-0000-0000-0000-000000000001', 'Available', 'success'),
('00000000-0000-0000-0000-000000000002', 'Lent', 'primary'),
('00000000-0000-0000-0000-000000000003', 'Unavailable', 'error')
ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color;

-- vehicles テーブルに status_id を追加し、既存の status (text) から移行する
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'vehicles' AND column_name = 'status_id') THEN
        ALTER TABLE vehicles ADD COLUMN status_id UUID REFERENCES vehicle_statuses(id);
        
        -- 既存データの移行
        UPDATE vehicles SET status_id = '00000000-0000-0000-0000-000000000001' WHERE status = 'Available';
        UPDATE vehicles SET status_id = '00000000-0000-0000-0000-000000000002' WHERE status = 'Lent';
        UPDATE vehicles SET status_id = '00000000-0000-0000-0000-000000000003' WHERE status IN ('Unavailable', 'Maintenance');
        
        -- テキストの status カラムを削除
        ALTER TABLE vehicles DROP COLUMN status;
    END IF;
END $$;
