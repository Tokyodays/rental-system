export interface Customer {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  passport_number?: string | null
  passport_url?: string | null
  // DB 上は NULL になり得る列（database.types.ts に合わせる）
  customer_statuses: {
    name: string
    color: string | null
  } | null
  status_id?: string | null
  created_at: string | null
}

/** customers テーブルの行（レガシー列 passport_image_url を含み得る） */
export interface CustomerRow extends Omit<Customer, 'passport_url'> {
  passport_url?: string | null
  passport_image_url?: string | null
}

export interface CustomerTransaction {
  id: string
  status: string | null
  start_at: string | null
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

// email は UNIQUE 制約があるため、未入力は空文字ではなく NULL で保存する
export interface CustomerInsertPayload extends Omit<NewCustomerForm, 'email'> {
  email: string | null
  id: string
  passport_url: string
  status_id: string | null
  store_id: string
}

export interface CustomerUpdatePayload extends Omit<NewCustomerForm, 'email'> {
  email: string | null
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

function toNullableEmail(email: string): string | null {
  return email.trim() || null
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
    email: toNullableEmail(form.email),
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
    email: toNullableEmail(form.email),
    phone: form.phone,
    passport_number: form.passport_number,
    status_id: form.status_id
  }

  if (passportUrl) {
    payload.passport_url = passportUrl
  }

  return payload
}
