-- Fix infinite RLS recursion using a dedicated lookup table.
--
-- Problem: get_auth_store_id() queries public.staff, but public.staff's RLS
-- calls get_auth_store_id() → infinite loop.
--
-- Solution: Create public.user_store_map as a thin lookup table whose own RLS
-- policy is non-recursive (only uses auth.uid(), not get_auth_store_id()).
-- get_auth_store_id() queries user_store_map instead of staff → no cycle.

-- 1. Lookup table
CREATE TABLE IF NOT EXISTS public.user_store_map (
  user_id  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE
);

ALTER TABLE public.user_store_map ENABLE ROW LEVEL SECURITY;

-- Non-recursive policy: only uses auth.uid(), not get_auth_store_id()
CREATE POLICY "user can read own store mapping"
  ON public.user_store_map FOR SELECT
  USING (user_id = auth.uid());

-- 2. Backfill from current staff data
INSERT INTO public.user_store_map (user_id, store_id)
SELECT id, store_id FROM public.staff WHERE store_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET store_id = EXCLUDED.store_id;

-- 3. Rewrite get_auth_store_id() to use lookup table (breaks the recursion)
CREATE OR REPLACE FUNCTION public.get_auth_store_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT store_id FROM public.user_store_map WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 4. Keep user_store_map in sync when staff.store_id changes
CREATE OR REPLACE FUNCTION public.sync_user_store_map()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.user_store_map WHERE user_id = OLD.id;
    RETURN OLD;
  END IF;

  IF NEW.store_id IS NOT NULL THEN
    INSERT INTO public.user_store_map (user_id, store_id)
    VALUES (NEW.id, NEW.store_id)
    ON CONFLICT (user_id) DO UPDATE SET store_id = EXCLUDED.store_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_staff_store_change ON public.staff;
CREATE TRIGGER on_staff_store_change
  AFTER INSERT OR UPDATE OF store_id OR DELETE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_store_map();
