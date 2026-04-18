-- Add username column and enforce alphanumeric check
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS username TEXT;

-- Remove non-alphanumeric chars for existing data backfill
UPDATE public.staff 
SET username = LOWER(REGEXP_REPLACE(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL;

-- Add unique constraint and check constraint
ALTER TABLE public.staff ADD CONSTRAINT staff_username_unique UNIQUE (username);
ALTER TABLE public.staff ADD CONSTRAINT staff_username_alphanumeric CHECK (username ~ '^[a-z0-9]+$');

-- Update trigger function to handle username from email (internal mapping)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_store_id UUID;
  v_username TEXT;
BEGIN
  SELECT id INTO default_store_id FROM public.stores LIMIT 1;
  
  -- Extract username from email (everything before @)
  v_username := LOWER(split_part(new.email, '@', 1));
  
  INSERT INTO public.staff (id, store_id, full_name, role_id, email, username)
  VALUES (
    new.id,
    default_store_id,
    COALESCE(new.raw_user_meta_data->>'full_name', v_username),
    '00000000-0000-0000-0001-000000000002',
    new.email,
    v_username
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    full_name = COALESCE(EXCLUDED.full_name, staff.full_name);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
