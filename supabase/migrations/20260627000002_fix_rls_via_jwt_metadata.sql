-- Fix infinite recursion in RLS by moving store_id lookup to JWT user_metadata.
--
-- Root cause: get_auth_store_id() queries public.staff, but public.staff's RLS
-- calls get_auth_store_id() → triggers RLS again → infinite loop.
--
-- Solution:
--   1. Store store_id in auth.users.raw_user_meta_data so it's included in the JWT.
--   2. Rewrite get_auth_store_id() to read from JWT (no table query = no recursion).
--   3. Update the staff sync trigger to keep metadata in sync.

-- Step 1: Backfill store_id into existing users' raw_user_meta_data
UPDATE auth.users u
SET raw_user_meta_data = COALESCE(u.raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('store_id', s.store_id::text)
FROM public.staff s
WHERE u.id = s.id
  AND s.store_id IS NOT NULL;

-- Step 2: Rewrite get_auth_store_id() to use JWT claims (no staff table query)
CREATE OR REPLACE FUNCTION public.get_auth_store_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'store_id')::uuid;
$$;

-- Step 3: Update the staff sync trigger to also write store_id into user metadata
CREATE OR REPLACE FUNCTION public.sync_store_id_to_user_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Keep raw_user_meta_data in sync whenever staff.store_id changes
  IF NEW.store_id IS NOT NULL AND (OLD IS NULL OR NEW.store_id IS DISTINCT FROM OLD.store_id) THEN
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object('store_id', NEW.store_id::text)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_staff_store_id_change ON public.staff;
CREATE TRIGGER on_staff_store_id_change
  AFTER INSERT OR UPDATE OF store_id ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.sync_store_id_to_user_metadata();
