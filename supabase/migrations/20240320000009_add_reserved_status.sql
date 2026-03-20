-- Reserved ステータスの追加
INSERT INTO vehicle_statuses (id, name, color) VALUES
('00000000-0000-0000-0000-000000000004', 'Reserved', 'warning')
ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color;
