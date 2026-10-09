export const LOCALE_CODES = ['en', 'th', 'lo', 'vi', 'ms'] as const

export type Locale = (typeof LOCALE_CODES)[number]

/** 1 つのメッセージ。5 言語すべての訳が必須（型で欠落を防ぐ） */
export type Entry = Record<Locale, string>

export type MessageCatalog = Record<string, Entry>

export const DEFAULT_LOCALE: Locale = 'en'

/** 言語切替 UI 用。label は各言語での自称 */
export const LOCALE_OPTIONS: { value: Locale, label: string, short: string }[] = [
  { value: 'en', label: 'English', short: 'EN' },
  { value: 'th', label: 'ภาษาไทย', short: 'TH' },
  { value: 'lo', label: 'ພາສາລາວ', short: 'LO' },
  { value: 'vi', label: 'Tiếng Việt', short: 'VI' },
  { value: 'ms', label: 'Bahasa Melayu', short: 'MS' }
]

/** Cookie / DB (stores.default_locale) の値を Locale に正規化する。旧コード 'la' は 'lo' として扱う */
export function toLocale(value: unknown): Locale | null {
  if (value === 'la') return 'lo'
  return (LOCALE_CODES as readonly string[]).includes(value as string) ? (value as Locale) : null
}
