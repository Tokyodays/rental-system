-- Add store_id to tables that need tenant isolation

-- customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- rentals
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- Note: for a local dev environment, it's helpful to populate existing rows with the default store
-- We do this for customers, reservations, and rentals.
DO $$ 
DECLARE
  default_store_id UUID;
BEGIN
  SELECT id INTO default_store_id FROM stores LIMIT 1;

  IF default_store_id IS NOT NULL THEN
    UPDATE customers SET store_id = default_store_id WHERE store_id IS NULL;
    UPDATE reservations SET store_id = default_store_id WHERE store_id IS NULL;
    UPDATE rentals SET store_id = default_store_id WHERE store_id IS NULL;
  END IF;
END $$;
