-- Allow public insert and select on rentals
DROP POLICY IF EXISTS "Allow public insert on rentals" ON rentals;
CREATE POLICY "Allow public insert on rentals" ON rentals FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on rentals" ON rentals;
CREATE POLICY "Allow public read on rentals" ON rentals FOR SELECT USING (true);

-- Allow public update on vehicles (to change status_id)
DROP POLICY IF EXISTS "Allow public update on vehicles" ON vehicles;
CREATE POLICY "Allow public update on vehicles" ON vehicles FOR UPDATE USING (true);

-- Also allow public update on customers (just in case, though it should be there)
DROP POLICY IF EXISTS "Allow public update on customers" ON customers;
CREATE POLICY "Allow public update on customers" ON customers FOR UPDATE USING (true);
