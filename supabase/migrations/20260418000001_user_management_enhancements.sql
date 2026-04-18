-- Add email column to staff table
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS email TEXT;

-- Update trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_store_id UUID;
BEGIN
  -- Get the first store as default
  SELECT id INTO default_store_id FROM public.stores LIMIT 1;
  
  INSERT INTO public.staff (id, store_id, full_name, role_id, email)
  VALUES (
    new.id,
    default_store_id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    '00000000-0000-0000-0001-000000000002', -- Default to 'user' role
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, staff.full_name);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing emails from auth.users
DO $$
BEGIN
  UPDATE public.staff s
  SET email = u.email
  FROM auth.users u
  WHERE s.id = u.id AND s.email IS NULL;
END;
$$;

-- Create helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.staff
    WHERE id = auth.uid()
    AND role_id = '00000000-0000-0000-0001-000000000001' -- admin role id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Allow users to read all staff if authenticated (for listing)
DROP POLICY IF EXISTS "Allow authenticated read all staff" ON public.staff;
CREATE POLICY "Allow authenticated read all staff" ON public.staff
  FOR SELECT TO authenticated USING (true);

-- Allow admins to manage staff records
DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;
CREATE POLICY "Admins can manage staff" ON public.staff
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Ensure users can still update their own profile (optional, but keep it if needed)
-- Since admins can now update all, this is covered if the user is an admin.
-- For non-admins, they might still want to update their own full_name.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.staff;
CREATE POLICY "Users can update their own profile" ON public.staff
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
