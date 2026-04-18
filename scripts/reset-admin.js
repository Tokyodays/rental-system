import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetAdminPassword() {
  const adminId = '8dc65512-2db8-4592-92df-a2b0e411a1ec'
  const newPassword = 'password123'

  console.log(`--- Resetting Password for Admin (${adminId}) ---`)

  const { data, error } = await supabase.auth.admin.updateUserById(
    adminId,
    { password: newPassword }
  )

  if (error) {
    console.error('❌ Failed to reset password:', error.message)
    process.exit(1)
  }

  console.log('✅ Admin password has been reset to: ' + newPassword)
  console.log('Now you can login with:')
  console.log('ID: admin')
  console.log('Password: ' + newPassword)
}

resetAdminPassword()
