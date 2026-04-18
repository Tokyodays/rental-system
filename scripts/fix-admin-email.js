import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdminEmail() {
  const adminId = '8dc65512-2db8-4592-92df-a2b0e411a1ec'
  const targetEmail = 'admin@rental.local'
  const newPassword = 'password123'

  console.log(`--- Fixing Admin Identity (${adminId}) ---`)

  // 1. メールアドレスとパスワードを強制的に上書き
  const { data, error } = await supabase.auth.admin.updateUserById(
    adminId,
    { 
      email: targetEmail,
      password: newPassword,
      email_confirm: true // 確認済みフラグを立てる
    }
  )

  if (error) {
    console.error('❌ Failed to fix admin user:', error.message)
    process.exit(1)
  }

  console.log('✅ Admin user has been synchronized!')
  console.log(`Current Email in Auth: ${data.user?.email}`)
  console.log('\nNow you should be able to login with:')
  console.log('ID: admin')
  console.log('Password: ' + newPassword)
}

fixAdminEmail()
