<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  vehicleId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const { uploadImage, deleteImageFromStorage, isUploading } = useVehicleImages()
const toast = useToast()

const tempVehicleId = ref(props.vehicleId || `temp-${Date.now()}`)
const fileInput = ref<HTMLInputElement | null>(null)
const isCameraOpen = ref(false)

/**
 * 写真を追加 (ファイル選択)
 */
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  if (props.modelValue.length >= 5) {
    toast.add({
      title: '上限に達しました',
      description: '写真は最大5枚まで登録可能です。',
      color: 'error'
    })
    return
  }

  const file = input.files[0]
  await processAndUpload(file)
  input.value = ''
}

/**
 * カメラで撮影した画像を処理
 */
const handleCapture = async (blob: Blob) => {
  const file = new File([blob], 'captured-photo.webp', { type: 'image/webp' })
  await processAndUpload(file)
  isCameraOpen.value = false
}

const processAndUpload = async (file: File) => {
  try {
    const url = await uploadImage(tempVehicleId.value, file)
    emit('update:modelValue', [...props.modelValue, url])
  } catch (error: any) {
    toast.add({
      title: 'アップロード失敗',
      description: error.message,
      color: 'error'
    })
  }
}

/**
 * 写真を削除
 */
const removePhoto = async (index: number) => {
  const url = props.modelValue[index]
  const newUrls = [...props.modelValue]
  newUrls.splice(index, 1)
  
  emit('update:modelValue', newUrls)
  
  // ストレージからも削除（非同期）
  deleteImageFromStorage(url)
}

const openFilePicker = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        車両の写真 ({{ modelValue.length }}/5)
      </label>
      <div class="flex gap-2">
        <UButton
          v-if="modelValue.length < 5"
          type="button"
          size="xs"
          variant="soft"
          icon="i-lucide-camera"
          label="写真を撮影"
          :loading="isUploading"
          @click="isCameraOpen = true"
        />
        <UButton
          v-if="modelValue.length < 5"
          type="button"
          size="xs"
          variant="ghost"
          icon="i-lucide-image"
          label="ファイル選択"
          @click="openFilePicker"
        />
      </div>
    </div>

    <!-- ライブカメラコンポーネント -->
    <CameraCapture
      v-if="isCameraOpen"
      @capture="handleCapture"
      @close="isCameraOpen = false"
    />

    <!-- 非表示のファイル入力 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- 画像一覧 -->
    <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
      <div
        v-for="(url, index) in modelValue"
        :key="url"
        class="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800"
      >
        <img :src="url" class="w-full h-full object-cover" />
        <button
          class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
          @click.prevent="removePhoto(index)"
        >
          <UIcon name="i-lucide-x" class="w-3 h-3" />
        </button>
      </div>

      <!-- プレースホルダー -->
      <button
        v-if="modelValue.length < 5"
        type="button"
        class="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-all"
        @click.prevent="isCameraOpen = true"
      >
        <UIcon name="i-lucide-plus" class="w-6 h-6" />
        <span class="text-[10px] mt-1">追加</span>
      </button>
    </div>
  </div>
</template>
