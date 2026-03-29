-- Allow staff to update their own store settings
CREATE POLICY "Staff can update their own store" ON stores
FOR UPDATE USING (
  id = public.get_auth_store_id()
);
