export default defineEventHandler(async (event) => {
  const adminClient = useSupabaseAdmin()
  await requireStaffRole(event, ['super_admin'])

  const body = await readBody(event)
  const { id: storeId } = body

  if (!storeId) {
    throw createError({ statusCode: 400, message: 'Store ID is required' })
  }

  // 1. transactions を削除
  const { error: transactionsError } = await adminClient.from('transactions').delete().eq('store_id', storeId)
  if (transactionsError) {
    throw createError({ statusCode: 500, message: `transactions delete failed: ${transactionsError.message}` })
  }

  // 2. reservations を削除
  const { error: reservationsError } = await adminClient.from('reservations').delete().eq('store_id', storeId)
  if (reservationsError) {
    throw createError({ statusCode: 500, message: `reservations delete failed: ${reservationsError.message}` })
  }

  // 3. vehicle_photos を削除
  const { data: vehicles, error: vehiclesSelectError } = await adminClient
    .from('vehicles')
    .select('id')
    .eq('store_id', storeId)
  if (vehiclesSelectError) {
    throw createError({ statusCode: 500, message: `vehicles select failed: ${vehiclesSelectError.message}` })
  }

  if (vehicles && vehicles.length > 0) {
    const vehicleIds = vehicles.map((v: any) => v.id)
    const { error: vehiclePhotosError } = await adminClient.from('vehicle_photos').delete().in('vehicle_id', vehicleIds)
    if (vehiclePhotosError) {
      throw createError({ statusCode: 500, message: `vehicle_photos delete failed: ${vehiclePhotosError.message}` })
    }
  }

  // 4. vehicles を削除
  const { error: vehiclesDeleteError } = await adminClient.from('vehicles').delete().eq('store_id', storeId)
  if (vehiclesDeleteError) {
    throw createError({ statusCode: 500, message: `vehicles delete failed: ${vehiclesDeleteError.message}` })
  }

  // 5. customers を削除
  const { error: customersError } = await adminClient.from('customers').delete().eq('store_id', storeId)
  if (customersError) {
    throw createError({ statusCode: 500, message: `customers delete failed: ${customersError.message}` })
  }

  // 6. staff テーブルから直接削除（FK 制約 profiles_store_id_fkey を先に解消）
  //    その後 auth ユーザーも削除してアカウントを完全に消す
  const { data: storeStaff, error: storeStaffSelectError } = await adminClient
    .from('staff')
    .select('id')
    .eq('store_id', storeId)
  if (storeStaffSelectError) {
    throw createError({ statusCode: 500, message: `staff select failed: ${storeStaffSelectError.message}` })
  }

  if (storeStaff && storeStaff.length > 0) {
    // staff レコードを先に削除して FK 制約を解消
    const { error: staffDeleteError } = await adminClient.from('staff').delete().eq('store_id', storeId)
    if (staffDeleteError) {
      throw createError({ statusCode: 500, message: `staff delete failed: ${staffDeleteError.message}` })
    }

    // auth ユーザーも削除（孤立アカウントを残さない）
    for (const member of storeStaff) {
      const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(member.id)
      if (authDeleteError) {
        throw createError({ statusCode: 500, message: `auth user delete failed: ${authDeleteError.message}` })
      }
    }
  }

  // 7. stores を削除
  const { error } = await adminClient.from('stores').delete().eq('id', storeId)
  if (error) {
    throw createError({ statusCode: 400, message: error.message })
  }

  return { success: true }
})
