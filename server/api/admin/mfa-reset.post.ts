import { ROLE_IDS } from '#shared/constants/auth'

/**
 * スタッフの二段階認証をリセットする（スマホの紛失・機種変更のとき）。
 * リセットされたユーザーは、次のログインで認証アプリを登録し直す。
 * - 店舗 admin: 自分の店舗のスタッフ（自分自身とオーナーは除く）
 * - オーナー: 各店舗のスタッフ（オーナー自身は Supabase の管理画面でリセットする）
 */
export default defineEventHandler(async (event) => {
  const adminClient = useSupabaseAdmin()
  const caller = await requireStaffRole(event, ['admin', 'super_admin'])

  const { id } = await readBody(event)
  if (!id) throw createError({ statusCode: 400, message: 'User ID is required' })
  if (id === caller.userId) throw createError({ statusCode: 400, message: 'Cannot reset your own two-step verification' })

  const { data: target } = await adminClient
    .from('staff')
    .select('store_id, role_id')
    .eq('id', id)
    .maybeSingle()
  if (!target || target.role_id === ROLE_IDS.SUPER_ADMIN) throw createError({ statusCode: 403, message: 'Forbidden' })
  if (!isOwner(caller) && target.store_id !== caller.staff.store_id) throw createError({ statusCode: 403, message: 'Forbidden' })

  const { data, error } = await adminClient.auth.admin.mfa.listFactors({ userId: id })
  if (error) throw createError({ statusCode: 500, message: error.message })
  for (const factor of data?.factors ?? []) {
    const { error: deleteError } = await adminClient.auth.admin.mfa.deleteFactor({ id: factor.id, userId: id })
    if (deleteError) throw createError({ statusCode: 500, message: deleteError.message })
  }

  return { success: true }
})
