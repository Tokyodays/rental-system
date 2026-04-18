import postgres from 'postgres'
import dotenv from 'dotenv'
import fs from 'fs'

const env = dotenv.parse(fs.readFileSync('.env'))
const sql = postgres({host: env.DB_HOST, password: env.DB_PASS, ssl:'require'})

async function totalFix() {
  console.log('--- Force Fixing Sync Trigger ---')
  try {
    await sql.unsafe(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.staff (id, email, username, role_id, store_id)
        VALUES (
          new.id,
          new.email,
          LOWER(COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))),
          '00000000-0000-0000-0001-000000000001',
          (SELECT id FROM public.stores LIMIT 1)
        )
        ON CONFLICT (id) DO UPDATE
        SET
          email = EXCLUDED.email,
          username = EXCLUDED.username,
          updated_at = now();
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `)
    console.log('✅ Trigger fixed successfully!')
  } catch (error) {
    console.error('❌ Failed to fix trigger:', error)
  } finally {
    await sql.end()
    process.exit(0)
  }
}

totalFix()
