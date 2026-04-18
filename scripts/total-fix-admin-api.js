import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function totalFixViaApi() {
  console.log('--- Fixing database via Supabase API ---')
  const ADMIN_ROLE_ID = '00000000-0000-0000-0001-000000000001'
  const STORE_ID = '00000000-0000-0000-0000-000000000001'

  try {
    // 1. ロール定義の確認と修正
    const { error: roleError } = await supabase
      .from('staff_roles')
      .upsert({ id: ADMIN_ROLE_ID, name: 'admin' })
    
    if (roleError) console.error('Role Error:', roleError.message)
    else console.log('✅ Admin role fixed.')

    // 2. 店舗の存在確認
    await supabase.from('stores').upsert({ id: STORE_ID, name: 'Main Store' })

    // 3. admin ユーザーの権限を強制上書き
    const { error: staffError } = await supabase
      .from('staff')
      .update({ 
        role_id: ADMIN_ROLE_ID,
        store_id: STORE_ID,
        username: 'admin'
      })
      .or(`username.eq.admin,id.eq.8dc65512-2db8-4592-92df-a2b0e411a1ec`)

    if (staffError) console.error('Staff Error:', staffError.message)
    else console.log('✅ Admin staff record updated.')

    console.log('\n--- SUCCESS ---')
    console.log('Please refresh the browser.')

  } catch (error) {
    console.error('❌ Unexpected Error:', error)
  }
}

totalFixViaApi()
