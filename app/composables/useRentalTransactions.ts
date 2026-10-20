export interface CompleteLendingParams {
  vehicle_id: string
  customer_id: string
  staff_id: string
  store_id: string
  start_at: string
  end_at: string
  start_mileage: number
  price: number
  helmet_lent: boolean
  key_handed_over: boolean
  /** 通貨がまちまちなので自由入力のテキスト（例: "5000 JPY", "$50"） */
  deposit: string
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
      p_vehicle_id:      params.vehicle_id,
      p_customer_id:     params.customer_id,
      p_staff_id:        params.staff_id,
      p_store_id:        params.store_id,
      p_start_at:        params.start_at,
      p_end_at:          params.end_at,
      p_start_mileage:   params.start_mileage,
      p_price:           params.price,
      p_helmet_lent:     params.helmet_lent,
      p_key_handed_over: params.key_handed_over,
      p_deposit:         params.deposit,
    }) as any)
    if (error) throw error
    return data as string
  }

  async function completeReturn(transactionId: string, returnedAt: string, vehicleId: string, customerId: string): Promise<void> {
    const { error } = await (supabase.rpc('complete_return', {
      p_transaction_id: transactionId,
      p_end_at:         returnedAt, // DB 側で returned_at に保存される
      p_vehicle_id:     vehicleId,
      p_customer_id:    customerId,
    }) as any)
    if (error) throw error
  }

  /** 延長: 延長記録の追加と transactions.end_at の更新を 1 トランザクションで実行する */
  async function extendRental(transactionId: string, newEndAt: string, additionalPrice: number, note: string): Promise<string> {
    const { data, error } = await (supabase.rpc('extend_rental', {
      p_transaction_id:   transactionId,
      p_new_end_at:       newEndAt,
      p_additional_price: additionalPrice,
      p_note:             note,
    }) as any)
    if (error) throw error
    return data as string
  }

  return { completeLending, completeReturn, extendRental }
}
