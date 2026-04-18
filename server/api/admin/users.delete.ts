import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // 1. 認証チェック
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // 2. 権限チェック
  const client = await serverSupabaseClient(event)
  const { data: staffMember } = await client
    .from('staff')
    .select('role_id')
    .eq('id', user.id)
    .single()

  const ADMIN_ROLE_ID = '00000000-0000-0000-0001-000000000001'
  if (staffMember?.role_id !== ADMIN_ROLE_ID) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // 3. IDの取得
  const body = await readBody(event)
  const { id } = body

  if (!id) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  // 自分自身は削除できないようにする
  if (id === user.id) {
    throw createError({ statusCode: 400, message: 'Cannot delete your own account' })
  }

  // 4. Supabase Admin API を使用してユーザーを削除
  const adminClient = useSupabaseAdmin()
  
  // auth.users から削除（カスケード設定があれば public.staff も削除されるはずだが、安全のため明示的に消すことも検討）
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(id)

  if (deleteError) {
    throw createError({ statusCode: 400, message: deleteError.message })
  }

  return { success: true }
})
