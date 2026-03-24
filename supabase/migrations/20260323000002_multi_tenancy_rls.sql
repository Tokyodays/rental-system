-- Implement robust store-based Row Level Security (RLS) policies

-- First, drop all existing policies on our main tables to ensure a clean slate
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('staff', 'vehicles', 'customers', 'rentals', 'reservations') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 0. Helper function to prevent infinite recursion in RLS
CREATE OR REPLACE FUNCTION public.get_auth_store_id()
RETURNS uuid AS $$
  SELECT store_id FROM public.staff WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 1. Staff table RLS
-- A staff member can read/write their own profile OR read/write profiles in the same store.
CREATE POLICY "Staff can view members in their store" ON staff FOR SELECT USING (
  store_id = public.get_auth_store_id() OR id = auth.uid()
);
CREATE POLICY "Staff can manage members in their store" ON staff FOR ALL USING (
  store_id = public.get_auth_store_id() OR id = auth.uid()
);

-- 2. Vehicles table RLS
CREATE POLICY "Staff can view vehicles in their store" ON vehicles FOR SELECT USING (
  store_id = public.get_auth_store_id()
);
CREATE POLICY "Staff can manage vehicles in their store" ON vehicles FOR ALL USING (
  store_id = public.get_auth_store_id()
);

-- 3. Customers table RLS
CREATE POLICY "Staff can view customers in their store" ON customers FOR SELECT USING (
  store_id = public.get_auth_store_id()
);
CREATE POLICY "Staff can manage customers in their store" ON customers FOR ALL USING (
  store_id = public.get_auth_store_id()
);

-- 4. Rentals table RLS
CREATE POLICY "Staff can view rentals in their store" ON rentals FOR SELECT USING (
  store_id = public.get_auth_store_id()
);
CREATE POLICY "Staff can manage rentals in their store" ON rentals FOR ALL USING (
  store_id = public.get_auth_store_id()
);

-- 5. Reservations table RLS
CREATE POLICY "Staff can view reservations in their store" ON reservations FOR SELECT USING (
  store_id = public.get_auth_store_id()
);
CREATE POLICY "Staff can manage reservations in their store" ON reservations FOR ALL USING (
  store_id = public.get_auth_store_id()
);
