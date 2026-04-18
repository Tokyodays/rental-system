import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Service Role Key を使用して Auth を強制操作します
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function repairDeveloperUser() {
  const username = 'developer'
  const password = 'password123'
  const internalEmail = `${username}@rental.local`
  const ADMIN_ROLE_ID = '00000000-0000-0000-0001-000000000001'

  console.log(`--- Repairing User: ${username} (${internalEmail}) ---`)

  // 1. 既存のユーザーがいれば削除（クリーンアップ）
  const { data: users } = await supabase.auth.admin.listUsers()
  const existingUser = users?.users.find(u => u.email === internalEmail || u.raw_user_meta_data?.username === username)
  
  if (existingUser) {
    console.log('Existing user found, deleting to recreate...')
    await supabase.auth.admin.deleteUser(existingUser.id)
  }

  // 2. 新規作成
  const { data, error } = await supabase.auth.admin.createUser({
    email: internalEmail,
    password: password,
    user_metadata: { username },
    email_confirm: true
  })

  if (error) {
    console.error('❌ Failed to create user:', error.message)
    process.exit(1)
  }

  const userId = data.user?.id
  console.log(`✅ Auth user created: ${userId}`)

  // 3. staff テーブルへの流し込み
  const { error: staffError } = await supabase
    .from('staff')
    .insert({
      id: userId,
      username: username,
      email: internalEmail,
      role_id: ADMIN_ROLE_ID,
      store_id: '00000000-0000-0000-0000-000000000001' // デフォルト店舗
    })
    .select()

  if (staffError) {
    // 既に存在する場合は更新
    await supabase.from('staff').update({
      username: username,
      role_id: ADMIN_ROLE_ID
    }).eq('id', userId)
  }

  console.log('\n--- SUCCESS ---')
  console.log(`ID: ${username}`)
  console.log(`Password: ${password}`)
  console.log('----------------')
}

repairDeveloperUser()
