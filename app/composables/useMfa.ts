/**
 * 二段階認証（TOTP）。全ユーザー必須で、パスワードだけのログイン（aal1）では店舗のデータを読めない（DB 側でも拒否）。
 * - 未登録: /mfa/setup で認証アプリに登録してから使う
 * - 登録済み: ログインのたびに /mfa/verify で6桁のコードを入力する
 */
export type MfaStep = 'setup' | 'verify'

export const MFA_PATHS: Record<MfaStep, string> = {
  setup: '/mfa/setup',
  verify: '/mfa/verify'
}

export const useMfa = () => {
  const supabase = useSupabaseClient()

  /** ログイン済みで二段階認証が済んでいなければ、次に必要な手順を返す（済んでいれば null） */
  async function pendingMfaStep(): Promise<MfaStep | null> {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    // 判定できないときは画面を止めない（データは DB 側で aal2 以外を拒否している）
    if (error || !data) return null
    if (data.currentLevel === 'aal2') return null
    return data.nextLevel === 'aal2' ? 'verify' : 'setup'
  }

  /** 認証アプリに登録するための QR コードと鍵を発行する（途中でやめた未確認の登録は作り直す） */
  async function startEnrollment() {
    const { data: factors } = await supabase.auth.mfa.listFactors()
    for (const factor of factors?.all ?? []) {
      if (factor.factor_type === 'totp' && factor.status === 'unverified') {
        await supabase.auth.mfa.unenroll({ factorId: factor.id })
      }
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `Rent Flow ${Date.now()}`
    })
    if (error) throw error
    return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret }
  }

  /** 6桁のコードで確認する。factorId を省略すると登録済みの認証アプリを使う */
  async function verifyCode(code: string, factorId?: string) {
    let id = factorId
    if (!id) {
      const { data } = await supabase.auth.mfa.listFactors()
      id = data?.totp?.[0]?.id
      if (!id) throw new Error('No authenticator is registered')
    }
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: id, code })
    if (error) throw error
  }

  return { pendingMfaStep, startEnrollment, verifyCode }
}
