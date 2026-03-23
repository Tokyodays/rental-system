-- Rename profiles to staff if it hasn't been done yet
DO $$ 
BEGIN 
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'staff') THEN
      -- If staff already exists, profiles was just inappropriately re-created by the base migration's IF NOT EXISTS. Drop it.
      DROP TABLE IF EXISTS profiles CASCADE;
  ELSE
      -- If staff does not exist, rename the original table.
      ALTER TABLE profiles RENAME TO staff;
  END IF;
END $$;
