import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import * as OTPAuth from 'otpauth'

/**
 * E2E 用の二段階認証（TOTP）ヘルパー。
 * 登録画面に表示される鍵をユーザーごとに e2e/.auth/totp.json（git 管理外）へ保存し、ログインのたびにコードを計算する。
 * 鍵が分からないのに登録済みのユーザーは、ログイン前に service role で認証アプリを削除し、登録し直させる
 * （ログイン後に削除しても、ブラウザのセッションが「登録済み」のままなので登録画面へ進めない）。
 */
const SECRETS_FILE = join(dirname(fileURLToPath(import.meta.url)), '.auth', 'totp.json')
const PERIOD_MS = 30_000

function readSecrets(): Record<string, string> {
  return existsSync(SECRETS_FILE) ? JSON.parse(readFileSync(SECRETS_FILE, 'utf8')) : {}
}

function saveSecret(username: string, secret: string) {
  mkdirSync(dirname(SECRETS_FILE), { recursive: true })
  writeFileSync(SECRETS_FILE, JSON.stringify({ ...readSecrets(), [username]: secret }, null, 2))
}

// 同じコードは1回しか使えないため、同じ時間枠で2回目が必要なら次の枠まで待つ。
// テスト前の準備（global-setup）とテスト本体は別プロセスなので、使ったコードはファイルで共有する
const USED_FILE = join(dirname(SECRETS_FILE), 'totp-used.json')

function readUsed(): Record<string, string> {
  return existsSync(USED_FILE) ? JSON.parse(readFileSync(USED_FILE, 'utf8')) : {}
}

export async function freshTotpCode(secret: string): Promise<string> {
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret) })
  let code = totp.generate()
  if (readUsed()[secret] === code) {
    await new Promise(r => setTimeout(r, PERIOD_MS - (Date.now() % PERIOD_MS) + 1000))
    code = totp.generate()
  }
  mkdirSync(dirname(USED_FILE), { recursive: true })
  writeFileSync(USED_FILE, JSON.stringify({ ...readUsed(), [secret]: code }))
  return code
}

/** ユーザーの認証アプリをすべて削除する（次のログインで登録画面になる） */
export async function resetMfaFactors(username: string) {
  const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: staff } = await admin.from('staff').select('id').eq('username', username.toLowerCase()).single()
  if (!staff) return
  const { data } = await admin.auth.admin.mfa.listFactors({ userId: staff.id })
  for (const factor of data?.factors ?? []) {
    await admin.auth.admin.mfa.deleteFactor({ id: factor.id, userId: staff.id })
  }
}

/** パスワードを入力する前に呼ぶ。鍵が分からない登録済みユーザーなら登録を消し、ログイン後に登録画面へ進ませる */
export async function prepareMfa(username: string) {
  if (!readSecrets()[username.toLowerCase()]) await resetMfaFactors(username)
}

/** パスワード入力後の二段階認証（登録または確認）を済ませる */
export async function completeMfa(page: Page, username: string) {
  await page.waitForURL(/\/mfa\/(setup|verify)/, { timeout: 15_000 })
  // 画面の準備（ハイドレーション）が終わる前に入力すると、入力が捨てられるため待つ
  await page.waitForLoadState('networkidle')

  let secret: string | undefined
  if (page.url().includes('/mfa/verify')) {
    secret = readSecrets()[username.toLowerCase()]
    if (!secret) throw new Error(`TOTP secret for ${username} is unknown. Call prepareMfa() before signing in.`)
  } else {
    await page.getByTestId('mfa-secret').waitFor({ timeout: 15_000 })
    secret = (await page.getByTestId('mfa-secret').innerText()).trim()
    saveSecret(username.toLowerCase(), secret)
  }

  await page.getByTestId('mfa-code').fill(await freshTotpCode(secret))
  await page.waitForURL(url => !url.pathname.startsWith('/mfa/'), { timeout: 15_000 })
}

/** テスト用スタッフのログイン状態（二段階認証済み）。global-setup で保存し、各テストはここから始める */
export const STAFF_STORAGE_STATE = join(dirname(SECRETS_FILE), 'staff.json')

/** 鍵が分かっているユーザーで、二段階認証まで済ませたクライアントを返す（API で DB の中身を確かめる用） */
export async function signInWithMfa(email: string, username: string, password: string): Promise<SupabaseClient> {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, { auth: { persistSession: false } })
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  const secret = readSecrets()[username.toLowerCase()]
  if (!secret) throw new Error(`TOTP secret for ${username} is unknown`)
  const { data } = await supabase.auth.mfa.listFactors()
  const factorId = data?.totp?.[0]?.id
  if (!factorId) throw new Error(`${username} has no verified authenticator`)
  const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: await freshTotpCode(secret) })
  if (verifyError) throw verifyError
  return supabase
}
