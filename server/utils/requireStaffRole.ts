import { serverSupabaseUser } from '#supabase/server'

/**
 * 認証済みユーザーの staff レコードを取得し、ロール名が allowedRoles に
 * 含まれることを検証する。失敗時は 401/403 を throw。
 * 戻り値: { userId, staff }（staff は role 名と store_id を含む）
 */
export const requireStaffRole = async (event: any, allowedRoles: string[]) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const adminClient = useSupabaseAdmin()
  const userId = (user as any).sub || user.id
  const { data: staff, error } = await adminClient
    .from('staff')
    .select('store_id, role_id, staff_roles(name)')
    .eq('id', userId)
    .single()

  const roleName = ((staff?.staff_roles as any)?.name || '').toLowerCase()
  if (error || !allowedRoles.includes(roleName)) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  return { userId, staff: staff! }
}
