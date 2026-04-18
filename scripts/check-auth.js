import postgres from 'postgres'
import dotenv from 'dotenv'
import fs from 'fs'

const env = dotenv.parse(fs.readFileSync('.env'))
const sql = postgres({host: env.DB_HOST, password: env.DB_PASS, ssl:'require'})

async function checkAuthUsers() {
  console.log('--- Checking auth.users table ---')
  try {
    const users = await sql`
      SELECT id, email, raw_user_meta_data->>'username' as username 
      FROM auth.users
    `
    console.log('Auth Users:', users)

    // developer というユーザー名を持つ ID があれば、staff テーブルに管理者として強制挿入
    const developer = users.find(u => u.username === 'developer' || u.email.includes('developer'))
    if (developer) {
      console.log('Found developer in auth.users, inserting into staff...')
      const ADMIN_ROLE_ID = '00000000-0000-0000-0001-000000000001'
      
      await sql`
        INSERT INTO public.staff (id, username, email, role_id, store_id)
        VALUES (
          ${developer.id}, 
          'developer', 
          ${developer.email}, 
          ${ADMIN_ROLE_ID},
          (SELECT id FROM public.stores LIMIT 1) -- 適当な店舗に所属させる
        )
        ON CONFLICT (id) DO UPDATE 
        SET role_id = ${ADMIN_ROLE_ID}, username = 'developer'
      `
      console.log('✅ Developer has been forced into staff table as Admin.')
    } else {
      console.log('⚠️ Developer not found even in auth.users.')
    }

  } catch (error) {
    console.error('❌ Failed:', error)
  } finally {
    await sql.end()
    process.exit(0)
  }
}

checkAuthUsers()
