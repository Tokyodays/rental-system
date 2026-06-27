-- Fix infinite recursion in staff table RLS policy.
--
-- get_auth_store_id() queries public.staff, but public.staff has RLS that calls
-- get_auth_store_id() → triggers RLS again → infinite loop.
-- Adding SET row_security = off makes the function's internal query bypass RLS,
-- breaking the cycle. The function is SECURITY DEFINER so it runs as the owner.

CREATE OR REPLACE FUNCTION public.get_auth_store_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security = off
AS $$
  SELECT store_id FROM public.staff WHERE id = auth.uid() LIMIT 1;
$$;
