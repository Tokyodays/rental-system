type StatusRow = { id: string; name: string; color?: string }

export const useStatusIds = () => {
  const supabase = useSupabaseClient()
  const vehicleStatuses = useState<StatusRow[]>('vehicle-statuses', () => [])
  const customerStatuses = useState<StatusRow[]>('customer-statuses', () => [])

  const ensureLoaded = async () => {
    if (vehicleStatuses.value.length && customerStatuses.value.length) return
    const [v, c] = await Promise.all([
      supabase.from('vehicle_statuses').select('id, name, color'),
      supabase.from('customer_statuses').select('id, name, color')
    ])
    vehicleStatuses.value = (v.data as StatusRow[]) || []
    customerStatuses.value = (c.data as StatusRow[]) || []
  }

  const vehicleStatusId = (name: 'Available' | 'Lent' | 'Unavailable' | 'Reserved') =>
    vehicleStatuses.value.find(s => s.name === name)?.id
  const customerStatusId = (name: 'Active' | 'Unactive' | 'Renting') =>
    customerStatuses.value.find(s => s.name === name)?.id

  return { vehicleStatuses, customerStatuses, ensureLoaded, vehicleStatusId, customerStatusId }
}
