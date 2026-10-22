import { DEFAULT_LOCALE, LOCALE_OPTIONS, messages, toLocale, type Locale } from '~/locales'

export type { Locale }
export type TranslateFn = (key: string, params?: Record<string, string | number>) => string

/**
 * 表示言語の優先順位
 * - ログイン中: 本人が選んだ言語（staff.locale）> 店舗のデフォルト言語（stores.default_locale）> en
 * - ログイン前・スタッフ情報の取得前: この端末で選んだ言語（Cookie）> en
 * Cookie にはログイン中に決まった言語も書き戻すので、再読み込み直後（スタッフ情報の取得前）も同じ言語で描画される。
 * 辞書は app/locales/ に 1 キー 5 言語の形で置く。未定義キーは英語 → キー名の順にフォールバック。
 */
export const useI18n = () => {
  const cookie = useCookie<string | null>('locale', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    default: () => null
  })
  const { staff } = useStaff()
  const supabase = useSupabaseClient()

  const locale = computed<Locale>(() => {
    if (staff.value) {
      return toLocale(staff.value.locale) ?? toLocale(staff.value.stores?.default_locale) ?? DEFAULT_LOCALE
    }
    return toLocale(cookie.value) ?? DEFAULT_LOCALE
  })

  if (import.meta.client) {
    watch(locale, (value) => {
      if (staff.value) cookie.value = value
    })
  }

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

  /**
   * 表示言語を変える。ログイン中は本人の設定として DB に保存する（どの端末でも同じ言語になる）。
   * null は「店舗のデフォルトに従う」（ログイン中のみ意味がある）。
   */
  const setLocale = async (value: Locale | null) => {
    if (!staff.value) {
      if (value) cookie.value = value
      return
    }
    const previous = staff.value.locale
    staff.value.locale = value
    const { error } = await supabase.rpc('set_my_locale', { p_locale: value ?? '' })
    if (error) {
      staff.value.locale = previous
      throw error
    }
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
