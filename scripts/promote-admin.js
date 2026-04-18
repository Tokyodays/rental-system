import postgres from 'postgres'
import dotenv from 'dotenv'
import fs from 'fs'

// .env を手動で読み込んでパスワードを確実に取得
const envConfig = dotenv.parse(fs.readFileSync('.env'))

const config = {
  host: envConfig.DB_HOST,
  port: envConfig.DB_PORT || 5432,
  database: envConfig.DB_NAME || 'postgres',
  username: envConfig.DB_USER || 'postgres',
  password: envConfig.DB_PASS, // dotenv.parse がクォートを適切に処理します
  ssl: 'require'
}

const sql = postgres(config)

async function promoteAllAdmins() {
  console.log('--- Promoting ALL users to Admin ---')
  const ADMIN_ROLE_ID = '00000000-0000-0000-0001-000000000001'
  
  try {
    const result = await sql`
      UPDATE public.staff
      SET role_id = ${ADMIN_ROLE_ID}
      RETURNING id, username, role_id;
    `
    
    if (result.length > 0) {
      console.log('✅ Successfully promoted all users:', result)
    } else {
      console.log('⚠️ No users found in staff table.')
    }
  } catch (error) {
    console.error('❌ Failed:', error)
  } finally {
    await sql.end()
    process.exit(0)
  }
}

promoteAllAdmins()
