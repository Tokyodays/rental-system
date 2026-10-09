export interface Customer {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  passport_number?: string | null
  passport_url?: string | null
  customer_statuses: {
    name: string
    color: string
  }
  status_id?: string
  created_at: string
}

/** customers テーブルの行（レガシー列 passport_image_url を含み得る） */
export interface CustomerRow extends Omit<Customer, 'passport_url'> {
  passport_url?: string | null
  passport_image_url?: string | null
}

export interface CustomerTransaction {
  id: string
  status: string
  start_at: string
  price: number | string | null
  vehicles: {
    name: string
    code: string
    vehicle_categories: { name: string; icon: string | null } | null
  } | null
}

export interface NewCustomerForm {
  full_name: string
  email: string
  phone: string
  passport_number: string
}

export interface CustomerUpdateForm extends NewCustomerForm {
  id: string
  status_id: string
}

export interface CustomerInsertPayload extends NewCustomerForm {
  id: string
  passport_url: string
  status_id: string | null
  store_id: string
}

export interface CustomerUpdatePayload extends NewCustomerForm {
  status_id: string
  passport_url?: string
}

/** Normalize column names (handle potential legacy name passport_image_url) */
export function toCustomer(row: CustomerRow): Customer {
  return {
    ...row,
    passport_url: row.passport_url || row.passport_image_url || null
  }
}

/** keyword は小文字化済みであること */
export function matchesCustomerSearch(customer: Customer, keyword: string): boolean {
  return Boolean(
    customer.full_name.toLowerCase().includes(keyword) ||
    (customer.email && customer.email.toLowerCase().includes(keyword))
  )
}

export function matchesCustomerStatusFilter(customer: Customer, statusFilter: string): boolean {
  return statusFilter === 'all' || customer.status_id === statusFilter
}

export function toCustomerInsertPayload(params: {
  id: string
  form: NewCustomerForm
  passportUrl: string
  statusId: string | null
  storeId: string
}): CustomerInsertPayload {
  const { id, form, passportUrl, statusId, storeId } = params
  return {
    id, // Explicitly provide the generated ID
    full_name: form.full_name,
    email: form.email,
    phone: form.phone,
    passport_number: form.passport_number,
    passport_url: passportUrl,
    status_id: statusId,
    store_id: storeId
  }
}

export function toCustomerUpdatePayload(form: CustomerUpdateForm, passportUrl: string): CustomerUpdatePayload {
  const payload: CustomerUpdatePayload = {
    full_name: form.full_name,
    email: form.email,
    phone: form.phone,
    passport_number: form.passport_number,
    status_id: form.status_id
  }

  if (passportUrl) {
    payload.passport_url = passportUrl
  }

  return payload
}
