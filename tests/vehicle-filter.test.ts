// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { DELETED_VEHICLE_FILTER, matchesVehicleFilter, type Vehicle } from '../app/utils/vehicle'

const vehicle = (overrides: Partial<Vehicle>): Vehicle => ({
  code: 'ABC',
  name: 'Honda Click',
  category: 'Bike',
  status: 'Available',
  statusColor: 'success',
  lastUpdated: '2026-10-01T00:00:00Z',
  icon: 'i-lucide-bike',
  lastMileage: 0,
  lastOilChangeOn: null,
  deletedAt: null,
  imageUrl: null,
  imageUrls: [],
  ...overrides
})

const filter = (status: string) => ({ search: '', category: 'All', status })

describe('matchesVehicleFilter with deleted vehicles', () => {
  const active = vehicle({})
  const deleted = vehicle({ status: 'Unavailable', deletedAt: '2026-10-23T00:00:00Z' })

  it('hides deleted vehicles from All and each status', () => {
    expect(matchesVehicleFilter(active, filter('All'))).toBe(true)
    expect(matchesVehicleFilter(deleted, filter('All'))).toBe(false)
    expect(matchesVehicleFilter(deleted, filter('Unavailable'))).toBe(false)
  })

  it('shows only deleted vehicles for the Deleted filter', () => {
    expect(matchesVehicleFilter(deleted, filter(DELETED_VEHICLE_FILTER))).toBe(true)
    expect(matchesVehicleFilter(active, filter(DELETED_VEHICLE_FILTER))).toBe(false)
  })

  it('still applies search and category to deleted vehicles', () => {
    expect(matchesVehicleFilter(deleted, { search: 'click', category: 'Bike', status: DELETED_VEHICLE_FILTER })).toBe(true)
    expect(matchesVehicleFilter(deleted, { search: 'yaris', category: 'All', status: DELETED_VEHICLE_FILTER })).toBe(false)
    expect(matchesVehicleFilter(deleted, { search: '', category: 'Car', status: DELETED_VEHICLE_FILTER })).toBe(false)
  })
})
