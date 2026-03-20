import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
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

if (!config.host || !config.password) {
  console.error('Error: DB_HOST or DB_PASS is not set in .env')
  process.exit(1)
}

const sql = postgres(config)

async function migrate() {
  console.log('--- Starting SQL Migrations ---')

  const migrationsDir = path.join(process.cwd(), 'supabase/migrations')
  const seedFile = path.join(process.cwd(), 'supabase/seed.sql')

  // Get all migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  try {
    // 1. Run migrations in order
    for (const file of files) {
      console.log(`Applying migration: ${file}...`)
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      await sql.unsafe(content)
    }

    // 2. Run seed data
    if (fs.existsSync(seedFile)) {
      console.log('Applying seed data...')
      const seedContent = fs.readFileSync(seedFile, 'utf8')
      await sql.unsafe(seedContent)
    }

    console.log('✅ All migrations applied successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await sql.end()
    process.exit(0)
  }
}

migrate()
