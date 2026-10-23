import { ROLE_IDS } from '#shared/constants/auth'

type AdminClient = ReturnType<typeof useSupabaseAdmin>
type Caller = Awaited<ReturnType<typeof requireStaffRole>>

/** 呼び出したユーザーが super_admin（オーナー）か */
export function isOwner(caller: Caller) {
  return caller.staff.role_id === ROLE_IDS.SUPER_ADMIN
}

/**
 * 二段階認証の状態を見たりリセットしたりできる店舗を決める。
 * 店舗 admin は自分の店舗だけ。オーナーは指定した店舗（必須）。
 */
export function resolveManagedStoreId(caller: Caller, requestedStoreId: unknown): string {
  if (!isOwner(caller)) {
    if (!caller.staff.store_id) throw createError({ statusCode: 403, message: 'Forbidden' })
    return caller.staff.store_id
  }
  if (typeof requestedStoreId !== 'string' || !requestedStoreId) {
    throw createError({ statusCode: 400, message: 'storeId is required' })
  }
  return requestedStoreId
}

/** ユーザーが登録済み（確認済み）の認証アプリ */
export async function listVerifiedFactors(adminClient: AdminClient, userId: string) {
  const { data, error } = await adminClient.auth.admin.mfa.listFactors({ userId })
  if (error) throw createError({ statusCode: 500, message: error.message })
  return (data?.factors ?? []).filter(f => f.status === 'verified')
}
