/**
 * 店舗のスタッフ一覧と、二段階認証を登録済みか。二段階認証のリセット画面で使う。
 * 店舗 admin は自分の店舗、オーナーは ?storeId= で指定した店舗。
 */
export default defineEventHandler(async (event) => {
  const adminClient = useSupabaseAdmin()
  const caller = await requireStaffRole(event, ['admin', 'super_admin'])
  const storeId = resolveManagedStoreId(caller, getQuery(event).storeId)

  const { data: members, error } = await adminClient
    .from('staff')
    .select('id, username, role_id, staff_roles(name)')
    .eq('store_id', storeId)
    .order('username')
  if (error) throw createError({ statusCode: 500, message: error.message })

  return await Promise.all((members ?? []).map(async member => ({
    id: member.id,
    username: member.username,
    role: (member.staff_roles as any)?.name ?? null,
    mfaEnabled: (await listVerifiedFactors(adminClient, member.id)).length > 0
  })))
})
