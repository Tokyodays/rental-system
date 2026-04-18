import postgres from 'postgres'
import dotenv from 'dotenv'
import fs from 'fs'

const env = dotenv.parse(fs.readFileSync('.env'))
const sql = postgres({
  host: env.DB_HOST,
  password: env.DB_PASS,
  ssl: 'require',
  connect_timeout: 10
})

async function addLocaleColumn() {
  console.log('--- Adding default_locale column to stores ---')
  try {
    await sql.unsafe(`
      ALTER TABLE public.stores 
      ADD COLUMN IF NOT EXISTS default_locale TEXT DEFAULT 'en';
    `)
    console.log('✅ Column default_locale added successfully!')
  } catch (error) {
    console.error('❌ Failed to add column:', error)
  } finally {
    await sql.end()
    process.exit(0)
  }
}

addLocaleColumn()
