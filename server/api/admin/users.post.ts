import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // 1. リクエスト送信者の認証チェック
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // 2. リクエスト送信者の権限と所属店舗のチェック（stores.post.ts と同様に adminClient + user.sub || user.id を使用）
  const adminClient = useSupabaseAdmin()
  const userId = user.sub || user.id
  const { data: adminStaff, error: staffError } = await adminClient
    .from('staff')
    .select('store_id, staff_roles(name)')
    .eq('id', userId)
    .single()

  const roleName = (adminStaff?.staff_roles as any)?.name
  if (staffError || roleName?.toLowerCase() !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden: Admin access required' })
  }

  if (!adminStaff!.store_id) {
    throw createError({ statusCode: 400, message: 'Admin must belong to a store' })
  }

  // 3. パラメータの取得
  const body = await readBody(event)
  const { username, password, role_id, store_id } = body

  if (!username || !password) {
    throw createError({ statusCode: 400, message: 'Username and password are required' })
  }

  // 内部的なメールアドレス形式に変換
  const internalEmail = `${username.toLowerCase()}@rental.local`

  // 4. Supabase Admin API を使用してユーザーを作成
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: internalEmail,
    password,
    user_metadata: { 
      username: username.toLowerCase()
    },
    email_confirm: true
  })

  if (authError) {
    throw createError({ statusCode: 400, message: authError.message })
  }

  // 5. 作成されたユーザーの staff レコードを更新
  //    指定された store_id があればそれを使用、なければ管理者の店舗を使用
  if (authData.user) {
    const { error: updateError } = await adminClient
      .from('staff')
      .update({ 
        role_id: role_id || '00000000-0000-0000-0001-000000000002', 
        store_id: store_id || adminStaff.store_id,
        username: username.toLowerCase(),
        email: internalEmail
      })
      .eq('id', authData.user.id)

    if (updateError) {
      console.error('[AdminAPI] Failed to update staff record:', updateError)
    }
  }

  return {
    user: authData.user
  }
})
