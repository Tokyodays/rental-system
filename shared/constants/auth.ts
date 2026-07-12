export const ROLE_IDS = {
  SUPER_ADMIN: '00000000-0000-0000-0001-000000000000',
  ADMIN: '00000000-0000-0000-0001-000000000001',
  STAFF: '00000000-0000-0000-0001-000000000002'
} as const

export const INTERNAL_EMAIL_DOMAIN = 'rental.local'

export const toInternalEmail = (username: string) =>
  `${username.toLowerCase()}@${INTERNAL_EMAIL_DOMAIN}`
