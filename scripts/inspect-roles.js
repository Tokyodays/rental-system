import postgres from 'postgres'
import dotenv from 'dotenv'
import fs from 'fs'

const env = dotenv.parse(fs.readFileSync('.env'))
const sql = postgres({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  ssl: 'require'
})

async function run() {
  try {
    const res = await sql`
      SELECT s.username, r.name as role_name 
      FROM public.staff s 
      JOIN public.staff_roles r ON s.role_id = r.id 
      WHERE s.username = 'admin'
    `
    console.log('Admin User Data:', JSON.stringify(res, null, 2))
    
    const roles = await sql`SELECT * FROM public.staff_roles`
    console.log('All Roles:', JSON.stringify(roles, null, 2))
    
  } catch (err) {
    console.error(err)
  } finally {
    process.exit(0)
  }
}
run()
