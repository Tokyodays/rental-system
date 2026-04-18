import postgres from 'postgres'
import dotenv from 'dotenv'
import fs from 'fs'

const env = dotenv.parse(fs.readFileSync('.env'))
const sql = postgres({host: env.DB_HOST, password: env.DB_PASS, ssl:'require'})

async function fixRolesAndAdmin() {
  console.log('--- Fixing staff_roles and admin user ---')
  const ADMIN_ROLE_ID = '00000000-0000-0000-0001-000000000001'
  const STORE_ID = '00000000-0000-0000-0000-000000000001'

  try {
    // 1. ロールが正しく定義されているか確認・挿入
    await sql`
      INSERT INTO public.staff_roles (id, name)
      VALUES (${ADMIN_ROLE_ID}, 'admin')
      ON CONFLICT (id) DO UPDATE SET name = 'admin';
    `
    console.log('✅ Admin role definition fixed.')

    // 2. 最初の店舗が存在することを確認
    await sql`
      INSERT INTO public.stores (id, name, address)
      VALUES (${STORE_ID}, 'Main Store', 'Headquarters')
      ON CONFLICT (id) DO NOTHING;
    `

    // 3. admin ユーザーのレコードを完全に整える
    await sql`
      UPDATE public.staff
      SET 
        role_id = ${ADMIN_ROLE_ID},
        store_id = ${STORE_ID},
        username = 'admin'
      WHERE username = 'admin' OR id = '8dc65512-2db8-4592-92df-a2b0e411a1ec';
    `
    console.log('✅ Admin staff record fully updated.')

  } catch (error) {
    console.error('❌ Failed:', error)
  } finally {
    await sql.end()
    process.exit(0)
  }
}

fixRolesAndAdmin()
