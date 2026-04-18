export const useVehicleImages = () => {
  const supabase = useSupabaseClient()
  const { staff } = useStaff()

  const isUploading = useState('vehicle-images-uploading', () => false)

  /**
   * 画像を WebP に変換する
   */
  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Failed to get canvas context'))

        // 画像のサイズを調整（必要に応じて）
        const MAX_WIDTH = 1200
        let width = img.width
        let height = img.height

        if (width > MAX_WIDTH) {
          height = (MAX_WIDTH / width) * height
          width = MAX_WIDTH
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to convert to WebP'))
        }, 'image/webp', 0.8) // 圧縮率 0.8
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 画像をアップロードする
   */
  const uploadImage = async (vehicleId: string, file: File): Promise<string> => {
    if (!staff.value?.store_id) throw new Error('Store ID not found')
    
    isUploading.value = true
    try {
      const webpBlob = await convertToWebP(file)
      // ブラウザ標準の crypto.randomUUID() を使用
      const fileName = `${crypto.randomUUID()}.webp`
      const filePath = `${staff.value.store_id}/${vehicleId}/${fileName}`

      const { data, error } = await supabase.storage
        .from('vehicle-photos')
        .upload(filePath, webpBlob, {
          contentType: 'image/webp',
          upsert: true
        })

      if (error) throw error

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-photos')
        .getPublicUrl(filePath)

      return publicUrl
    } finally {
      isUploading.value = false
    }
  }

  /**
   * ストレージから画像を削除する
   */
  const deleteImageFromStorage = async (url: string) => {
    try {
      // URLからパスを抽出
      const pathPart = url.split('/storage/v1/object/public/vehicle-photos/')[1]
      if (!pathPart) return

      const { error } = await supabase.storage
        .from('vehicle-photos')
        .remove([pathPart])

      if (error) throw error
    } catch (err) {
      console.error('Failed to delete image from storage:', err)
    }
  }

  return {
    isUploading,
    uploadImage,
    deleteImageFromStorage
  }
}
