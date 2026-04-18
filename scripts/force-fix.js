import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS,
  ssl: 'require'
}

const sql = postgres(config)

async function runFix() {
  console.log('--- Force Fixing username column ---')
  try {
    // 1. Rename column if exists
    await sql.unsafe(`
      DO $$
      BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff' AND column_name = 'full_name') THEN
              ALTER TABLE public.staff RENAME COLUMN full_name TO username;
              RAISE NOTICE 'Renamed full_name to username';
          ELSE
              RAISE NOTICE 'full_name column not found, checking if username already exists';
          END IF;
      END $$;
    `)

    // 2. Ensure username column exists (in case rename didn't happen)
    await sql.unsafe(`
      ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS username TEXT;
    `)

    // 3. Backfill
    await sql.unsafe(`
      UPDATE public.staff
      SET username = LOWER(REGEXP_REPLACE(username, '[^a-zA-Z0-9]', '', 'g'))
      WHERE username IS NOT NULL AND username ~ '[^a-z0-9]';
    `)

    await sql.unsafe(`
      UPDATE public.staff
      SET username = 'admin'
      WHERE id = '8dc65512-2db8-4592-92df-a2b0e411a1ec' OR username IS NULL OR username = '';
    `)

    console.log('✅ Force fix applied successfully!')
  } catch (error) {
    console.error('❌ Force fix failed:', error)
  } finally {
    await sql.end()
    process.exit(0)
  }
}

runFix()
