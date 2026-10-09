export interface CompleteLendingParams {
  vehicle_id: string
  customer_id: string
  staff_id: string
  store_id: string
  start_at: string
  end_at: string
  start_mileage: number
  price: number
}

/**
 * 貸出・返却処理の DB 書き込み。
 * 各関数は Supabase RPC を呼び出し、3 操作を 1 トランザクションで実行する。
 * 失敗時は例外を投げる（呼び出し側で toast 表示）。
 */
export const useRentalTransactions = () => {
  const supabase = useSupabaseClient()

  async function completeLending(params: CompleteLendingParams): Promise<string> {
    const { data, error } = await (supabase.rpc('complete_lending', {
      p_vehicle_id:    params.vehicle_id,
      p_customer_id:   params.customer_id,
      p_staff_id:      params.staff_id,
      p_store_id:      params.store_id,
      p_start_at:      params.start_at,
      p_end_at:        params.end_at,
      p_start_mileage: params.start_mileage,
      p_price:         params.price,
    }) as any)
    if (error) throw error
    return data as string
  }

  async function completeReturn(transactionId: string, endAt: string, vehicleId: string, customerId: string): Promise<void> {
    const { error } = await (supabase.rpc('complete_return', {
      p_transaction_id: transactionId,
      p_end_at:         endAt,
      p_vehicle_id:     vehicleId,
      p_customer_id:    customerId,
    }) as any)
    if (error) throw error
  }

  return { completeLending, completeReturn }
}
