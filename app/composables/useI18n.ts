import { DEFAULT_LOCALE, LOCALE_OPTIONS, messages, toLocale, type Locale } from '~/locales'

export type { Locale }
export type TranslateFn = (key: string, params?: Record<string, string | number>) => string

/**
 * 表示言語の優先順位: Cookie（ランディング/設定画面で選択）> 店舗のデフォルト言語 > en
 * 辞書は app/locales/ に 1 キー 5 言語の形で置く。未定義キーは英語 → キー名の順にフォールバック。
 */
export const useI18n = () => {
  const cookie = useCookie<string | null>('locale', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    default: () => null
  })
  const { staff } = useStaff()

  const locale = computed<Locale>({
    get: () => toLocale(cookie.value) ?? toLocale(staff.value?.stores?.default_locale) ?? DEFAULT_LOCALE,
    set: (value) => { cookie.value = value }
  })

  const t: TranslateFn = (key, params) => {
    const entry = messages[key]
    const text = entry?.[locale.value] || entry?.[DEFAULT_LOCALE] || key
    if (!params) return text
    return text.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`))
  }

  /** DB 由来の名称（ステータス名・カテゴリ名など）を翻訳する。辞書に無い値（店舗が独自に追加した名称）はそのまま返す */
  const tName = (prefix: 'status' | 'category', name: string | null | undefined) => {
    if (!name) return t('unknown')
    return messages[`${prefix}.${name}`] ? t(`${prefix}.${name}`) : name
  }

  const setLocale = (value: Locale) => {
    locale.value = value
  }

  // 日付・数値の整形に使う BCP 47 タグ
  const dateLocale = computed(() => ({ en: 'en-US', th: 'th-TH-u-ca-gregory', lo: 'lo-LA', vi: 'vi-VN', ms: 'ms-MY' })[locale.value])

  return {
    locale,
    t,
    tName,
    setLocale,
    dateLocale,
    availableLocales: LOCALE_OPTIONS
  }
}
