const PASSPORT_BUCKET = 'customer-passports'

function toPassportFilePath(customerId: string) {
  return `passports/${customerId}-passport.webp`
}

export function useCustomerPassport() {
  const client = useSupabaseClient()

  /** パスポート画像をアップロード（上書き）し、保存先パスを返す */
  async function uploadPassportImage(customerId: string, blob: Blob): Promise<string> {
    const filePath = toPassportFilePath(customerId)

    const { error: uploadError } = await client
      .storage
      .from(PASSPORT_BUCKET)
      .upload(filePath, blob, {
        upsert: true,
        contentType: 'image/webp'
      })

    if (uploadError) throw uploadError
    return filePath
  }

  function getPassportPublicUrl(path: string | null | undefined) {
    if (!path) return null

    // If it's already a full URL, return it
    if (path.startsWith('http')) return path

    const { data } = client.storage.from(PASSPORT_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  return { uploadPassportImage, getPassportPublicUrl }
}
