export const useCurrency = () => {
  const { staff } = useStaff()
  const supabase = useSupabaseClient()

  interface CurrencyRecord {
    id: number
    currency_text: string
    currency_symbol: string
  }

  const currencies = useState<CurrencyRecord[]>('currency-list', () => [])

  const fetchCurrencies = async () => {
    if (currencies.value.length > 0) return
    
    const { data, error } = await supabase
      .from('currency' as any)
      .select('*')
      .order('id')
    
    if (data && !error) {
      currencies.value = data as CurrencyRecord[]
    }
  }

  // 初期化時に非同期で取得
  if (process.client) {
    onMounted(() => {
      fetchCurrencies()
    })
  }

  // 現在の通貨記号を取得 (staff -> stores -> currency から)
  const currentSymbol = computed(() => {
    return staff.value?.stores?.currency?.currency_symbol || '—'
  })

  // 金額をフォーマット（記号を前に出す）
  const formatPrice = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '—'
    return `${currentSymbol.value} ${amount.toLocaleString()}`
  }

  // 通貨設定を更新
  const updateCurrency = async (currencyId: number) => {
    if (!staff.value?.store_id) return

    const { error } = await supabase
      .from('stores' as any)
      .update({ currency_id: currencyId } as any)
      .eq('id', staff.value.store_id)

    if (error) throw error
  }

  return {
    currencies,
    fetchCurrencies,
    currentSymbol,
    formatPrice,
    updateCurrency
  }
}
