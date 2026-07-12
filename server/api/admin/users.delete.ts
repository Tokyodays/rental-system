import { serverSupabaseUser } from '#supabase/server'
import { ROLE_IDS } from '#shared/constants/auth'

export default defineEventHandler(async (event) => {
  // 1. 認証チェック
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const adminClient = useSupabaseAdmin()
  const userId = user.sub || user.id

  // 2. 権限チェック（adminClient で RLS をバイパスして確実に取得）
  const { data: adminStaff, error: staffError } = await adminClient
    .from('staff')
    .select('role_id, store_id')
    .eq('id', userId)
    .single()

  if (staffError || adminStaff?.role_id !== ROLE_IDS.ADMIN) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // 3. IDの取得
  const body = await readBody(event)
  const { id } = body

  if (!id) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  // 自分自身は削除できないようにする
  if (id === userId) {
    throw createError({ statusCode: 400, message: 'Cannot delete your own account' })
  }

  // 4. public.staff を先に削除（staff.id → auth.users.id FK が NO ACTION のため子を先に消す）
  const { error: staffDeleteError } = await adminClient
    .from('staff')
    .delete()
    .eq('id', id)

  if (staffDeleteError) {
    console.error('[AdminAPI] Failed to delete staff record:', staffDeleteError)
    throw createError({ statusCode: 400, message: staffDeleteError.message })
  }

  // 5. auth.users から削除
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(id)

  if (deleteError) {
    console.error('[AdminAPI] Failed to delete auth user:', deleteError)
    throw createError({ statusCode: 400, message: deleteError.message })
  }

  return { success: true }
})
