import { ROLE_IDS, toInternalEmail } from '#shared/constants/auth'

export default defineEventHandler(async (event) => {
  // 1-2. 認証・権限チェック（スタッフ作成は admin, super_admin のみ許可）
  const adminClient = useSupabaseAdmin()
  const { staff: adminStaff } = await requireStaffRole(event, ['admin', 'super_admin'])

  // 3. パラメータの取得
  const body = await readBody(event)
  const { username, password, role_id, store_id } = body

  if (!username || !password) {
    throw createError({ statusCode: 400, message: 'Username and password are required' })
  }

  // super_admin は店舗を持たない。それ以外のロールは必ず店舗に所属させる
  //   - super_admin が作成する場合: body の store_id が必須
  //   - admin が作成する場合: 自身の店舗を使う
  const targetStoreId = store_id || adminStaff!.store_id
  if ((role_id || ROLE_IDS.STAFF) !== ROLE_IDS.SUPER_ADMIN && !targetStoreId) {
    throw createError({ statusCode: 400, message: 'store_id is required' })
  }

  // 内部的なメールアドレス形式に変換
  const internalEmail = toInternalEmail(username)

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

  // 5. 作成されたユーザーの staff レコードを upsert
  //    トリガーが store_id NOT NULL 制約で失敗した場合も INSERT で補完する
  if (authData.user) {
    const { error: upsertError } = await adminClient
      .from('staff')
      .upsert({
        id: authData.user.id,
        role_id: role_id || ROLE_IDS.STAFF,
        store_id: targetStoreId,
        username: username.toLowerCase()
      }, { onConflict: 'id' })

    if (upsertError) {
      console.error('[AdminAPI] Failed to upsert staff record:', upsertError)
      await adminClient.auth.admin.deleteUser(authData.user.id)
      throw createError({ statusCode: 500, message: `Failed to create staff record: ${upsertError.message}` })
    }
  }

  return {
    user: authData.user
  }
})
