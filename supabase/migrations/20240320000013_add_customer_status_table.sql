-- Create customer_statuses table
CREATE TABLE IF NOT EXISTS customer_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial statuses
INSERT INTO customer_statuses (name, color) VALUES
('Active', 'success'),
('Unactive', 'neutral'),
('Renting', 'primary')
ON CONFLICT (name) DO NOTHING;

-- Add status_id to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status_id UUID REFERENCES customer_statuses(id);

-- Assign random status to existing customers
UPDATE customers 
SET status_id = (SELECT id FROM customer_statuses ORDER BY random() LIMIT 1)
WHERE status_id IS NULL;

-- Enable RLS
ALTER TABLE customer_statuses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on customer_statuses" ON customer_statuses;
CREATE POLICY "Allow public read on customer_statuses" ON customer_statuses FOR SELECT USING (true);
