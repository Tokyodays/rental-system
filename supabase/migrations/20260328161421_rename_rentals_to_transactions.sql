-- Rename rentals table to transactions
ALTER TABLE rentals RENAME TO transactions;

-- Rename Foreign Key Constraints
ALTER TABLE transactions RENAME CONSTRAINT rentals_vehicle_id_fkey TO transactions_vehicle_id_fkey;
ALTER TABLE transactions RENAME CONSTRAINT rentals_customer_id_fkey TO transactions_customer_id_fkey;
ALTER TABLE transactions RENAME CONSTRAINT rentals_staff_id_fkey TO transactions_staff_id_fkey;
ALTER TABLE transactions RENAME CONSTRAINT rentals_store_id_fkey TO transactions_store_id_fkey;

-- Rename Primary Key Index
ALTER INDEX IF EXISTS rentals_pkey RENAME TO transactions_pkey;

-- Recreation of RLS Policies for the new table name
DROP POLICY IF EXISTS "Staff can view their store's rentals" ON transactions;
CREATE POLICY "Staff can view their store's transactions"
    ON transactions FOR SELECT
    USING (store_id = (SELECT store_id FROM staff WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff can insert their store's rentals" ON transactions;
CREATE POLICY "Staff can insert their store's transactions"
    ON transactions FOR INSERT
    WITH CHECK (store_id = (SELECT store_id FROM staff WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff can update their store's rentals" ON transactions;
CREATE POLICY "Staff can update their store's transactions"
    ON transactions FOR UPDATE
    USING (store_id = (SELECT store_id FROM staff WHERE id = auth.uid()));
