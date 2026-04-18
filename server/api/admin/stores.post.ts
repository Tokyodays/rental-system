import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // 1. 認証チェック
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // 2. 権限チェック (管理者のみ店舗追加が可能とする)
  // RLSをバイパスして確実にロールを確認するため AdminClient (Service Role) を使用
  const adminClient = useSupabaseAdmin()
  const userId = user.sub || user.id
  const { data: staff, error: staffError } = await adminClient
    .from('staff')
    .select('username, role_id, staff_roles(name)')
    .eq('id', userId)
    .single()

  const roleName = (staff?.staff_roles as any)?.name

  if (staffError || roleName?.toLowerCase() !== 'admin') {
    throw createError({ statusCode: 403, message: `Forbidden: Admin access required` })
  }

  // 3. パラメータの取得
  const body = await readBody(event)
  const { name, address, currency_id } = body

  if (!name) {
    throw createError({ statusCode: 400, message: 'Store name is required' })
  }

  // 4. 店舗の作成
  const { data: store, error: storeError } = await adminClient
    .from('stores')
    .insert({
      name,
      address,
      currency_id: currency_id || 1 // Default currency
    })
    .select()
    .single()

  if (storeError) {
    throw createError({ statusCode: 400, message: storeError.message })
  }

  return { store }
})
