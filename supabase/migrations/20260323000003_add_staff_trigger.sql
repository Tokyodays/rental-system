-- Trigger to automatically create a staff record for a newly registered user
-- For demo purposes, assign them to the first store automatically.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_store_id UUID;
BEGIN
  SELECT id INTO default_store_id FROM public.stores LIMIT 1;
  
  INSERT INTO public.staff (id, store_id, full_name, role)
  VALUES (
    new.id,
    default_store_id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'staff'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill any existing auth.users into the staff table
DO $$
DECLARE
  u record;
  default_store_id UUID;
BEGIN
  SELECT id INTO default_store_id FROM public.stores LIMIT 1;

  FOR u IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    IF NOT EXISTS (SELECT 1 FROM public.staff WHERE id = u.id) THEN
      INSERT INTO public.staff (id, store_id, full_name, role)
      VALUES (
        u.id, 
        default_store_id, 
        COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), 
        'staff'
      );
    END IF;
  END LOOP;
END;
$$;
