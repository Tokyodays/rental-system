export default defineEventHandler(async (event) => {
  // 1-2. 認証・権限チェック（店舗作成は super_admin のみ許可）
  const adminClient = useSupabaseAdmin()
  await requireStaffRole(event, ['super_admin'])

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
