export default defineEventHandler(async (event) => {
  const adminClient = useSupabaseAdmin()
  await requireStaffRole(event, ['super_admin'])

  const body = await readBody(event)
  const { id: storeId } = body

  if (!storeId) {
    throw createError({ statusCode: 400, message: 'Store ID is required' })
  }

  // 1. transactions を削除
  await adminClient.from('transactions').delete().eq('store_id', storeId)

  // 2. reservations を削除
  await adminClient.from('reservations').delete().eq('store_id', storeId)

  // 3. vehicle_photos を削除
  const { data: vehicles } = await adminClient
    .from('vehicles')
    .select('id')
    .eq('store_id', storeId)

  if (vehicles && vehicles.length > 0) {
    const vehicleIds = vehicles.map((v: any) => v.id)
    await adminClient.from('vehicle_photos').delete().in('vehicle_id', vehicleIds)
  }

  // 4. vehicles を削除
  await adminClient.from('vehicles').delete().eq('store_id', storeId)

  // 5. customers を削除
  await adminClient.from('customers').delete().eq('store_id', storeId)

  // 6. staff テーブルから直接削除（FK 制約 profiles_store_id_fkey を先に解消）
  //    その後 auth ユーザーも削除してアカウントを完全に消す
  const { data: storeStaff } = await adminClient
    .from('staff')
    .select('id')
    .eq('store_id', storeId)

  if (storeStaff && storeStaff.length > 0) {
    // staff レコードを先に削除して FK 制約を解消
    await adminClient.from('staff').delete().eq('store_id', storeId)

    // auth ユーザーも削除（孤立アカウントを残さない）
    for (const member of storeStaff) {
      await adminClient.auth.admin.deleteUser(member.id)
    }
  }

  // 7. stores を削除
  const { error } = await adminClient.from('stores').delete().eq('id', storeId)
  if (error) {
    throw createError({ statusCode: 400, message: error.message })
  }

  return { success: true }
})
