/** 貸出開始時に transactions へ insert するペイロード */
export interface LendingTransactionInsert {
  vehicle_id: string
  customer_id: string
  staff_id: string
  store_id: string
  start_at: string
  end_at: string
  start_mileage: number
  price: number
  status: 'Active'
}

/**
 * 貸出・返却処理の DB 書き込み（1ステップ1関数）。
 * いずれも失敗時は例外を投げる（呼び出し側で toast 表示）。
 */
export const useRentalTransactions = () => {
  const supabase = useSupabaseClient()

  async function createLendingTransaction(payload: LendingTransactionInsert) {
    const { error: rentalError } = await (supabase.from('transactions').insert(payload as any) as any)
    if (rentalError) throw rentalError
  }

  async function updateTransactionToCompleted(transactionId: string, endAt: string) {
    const { error: rError } = await ((supabase.from('transactions') as any)
      .update({ status: 'Completed', end_at: endAt })
      .eq('id', transactionId) as any)
    if (rError) throw rError
  }

  async function updateVehicleStatus(vehicleId: string, statusId: string | undefined) {
    const { error: vehicleError } = await (supabase.from('vehicles') as any)
      .update({ status_id: statusId }).eq('id', vehicleId)
    if (vehicleError) throw new Error(`Vehicle status update failed: ${vehicleError.message}`)
  }

  async function updateCustomerStatus(customerId: string, statusId: string | undefined) {
    const { error: customerError } = await (supabase.from('customers') as any)
      .update({ status_id: statusId }).eq('id', customerId)
    if (customerError) throw new Error(`Customer status update failed: ${customerError.message}`)
  }

  return { createLendingTransaction, updateTransactionToCompleted, updateVehicleStatus, updateCustomerStatus }
}
