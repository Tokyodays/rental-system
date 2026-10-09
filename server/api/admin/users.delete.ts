export default defineEventHandler(async (event) => {
  // 1-2. 認証・権限チェック（スタッフ削除は admin のみ許可。super_admin 不可は現行仕様）
  const adminClient = useSupabaseAdmin()
  const { userId } = await requireStaffRole(event, ['admin'])

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
