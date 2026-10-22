const PASSPORT_BUCKET = 'customer-passports'
const PASSPORT_URL_TTL_SECONDS = 60 * 60

// 先頭フォルダを店舗IDにする。ストレージの RLS がこのフォルダで店舗を判定する
function toPassportFilePath(storeId: string, customerId: string) {
  return `${storeId}/${customerId}.jpg`
}

export function useCustomerPassport() {
  const client = useSupabaseClient()

  /** パスポート画像をアップロード（上書き）し、保存先パスを返す */
  async function uploadPassportImage(storeId: string, customerId: string, blob: Blob): Promise<string> {
    const filePath = toPassportFilePath(storeId, customerId)

    const { error: uploadError } = await client
      .storage
      .from(PASSPORT_BUCKET)
      .upload(filePath, blob, {
        upsert: true,
        contentType: blob.type || 'image/jpeg'
      })

    if (uploadError) throw uploadError
    return filePath
  }

  /** 表示用の署名付きURLを返す（バケットは非公開のため公開URLでは読めない） */
  async function getPassportSignedUrl(path: string | null | undefined): Promise<string | null> {
    if (!path) return null

    // If it's already a full URL, return it
    if (path.startsWith('http')) return path

    const { data, error } = await client.storage.from(PASSPORT_BUCKET).createSignedUrl(path, PASSPORT_URL_TTL_SECONDS)
    if (error) {
      console.error('Failed to create passport signed URL:', error)
      return null
    }
    return data.signedUrl
  }

  /** パスポート画像を削除する（顧客レコード削除後の後始末のため、失敗してもエラーにしない） */
  async function deletePassportImage(path: string | null | undefined) {
    if (!path || path.startsWith('http')) return

    const { error } = await client.storage.from(PASSPORT_BUCKET).remove([path])
    if (error) console.error('Failed to delete passport image:', error)
  }

  return { uploadPassportImage, getPassportSignedUrl, deletePassportImage }
}
