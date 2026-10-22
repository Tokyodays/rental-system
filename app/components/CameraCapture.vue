<script setup lang="ts">
const emit = defineEmits<{
  (e: 'capture', blob: Blob): void
  (e: 'close'): void
}>()

const { t } = useI18n()
const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const stream = ref<MediaStream | null>(null)
const isPlaying = ref(false)
const error = ref('')

// カメラの起動
const startCamera = async () => {
  error.value = ''
  try {
    const constraints = {
      video: {
        facingMode: 'environment', // 背面カメラを優先
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    }
    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    if (video.value) {
      video.value.srcObject = stream.value
      isPlaying.value = true
    }
  } catch (err: any) {
    console.error('Camera access error:', err)
    error.value = t('camera.denied')
  }
}

// 撮影
const takePhoto = () => {
  if (!video.value || !canvas.value) return

  const v = video.value
  const c = canvas.value
  c.width = v.videoWidth
  c.height = v.videoHeight

  const ctx = c.getContext('2d')
  if (!ctx) return

  ctx.drawImage(v, 0, 0, c.width, c.height)

  // Safari は WebP のエンコードに未対応（PNG にフォールバックする）ため JPEG で出力する
  c.toBlob((blob) => {
    if (blob) {
      emit('capture', blob)
      stopCamera()
    }
  }, 'image/jpeg', 0.85)
}

// カメラの停止
const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  isPlaying.value = false
}

// モーダルの中身は遅れて描画されるため、video 要素が現れた時点でカメラを起動する
watch(video, (el) => {
  if (el && !stream.value) startCamera()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <!-- 呼び出し側のモーダルの上に重ねて開く（v-if で表示を制御） -->
  <UModal
    :open="true"
    :title="t('camera.title')"
    :ui="{ body: 'p-0 sm:p-0' }"
    @update:open="(open) => { if (!open) emit('close') }"
  >
    <template #body>
      <!-- ビデオプレビュー -->
      <div class="relative w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
        <video
          ref="video"
          autoplay
          playsinline
          muted
          class="w-full h-full object-cover"
        ></video>

        <!-- ガイドライン -->
        <div class="absolute inset-0 pointer-events-none border-[2px] border-white/30 m-6 rounded-lg"></div>

        <!-- エラー表示 -->
        <div v-if="error" class="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div class="bg-white/10 backdrop-blur-md p-6 rounded-2xl max-w-xs">
            <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-400 mb-3 mx-auto" />
            <p class="text-white text-sm">{{ error }}</p>
            <UButton
              type="button"
              :label="t('close')"
              variant="soft"
              color="neutral"
              class="mt-4"
              @click="emit('close')"
            />
          </div>
        </div>
      </div>

      <!-- コントロール -->
      <div class="p-4 flex items-center justify-center">
        <button
          type="button"
          data-testid="camera-shutter"
          :aria-label="t('camera.title')"
          class="group relative flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          @click="takePhoto"
          :disabled="!isPlaying"
        >
          <div class="w-16 h-16 rounded-full border-4 border-slate-300 dark:border-slate-600 flex items-center justify-center p-1 transition-transform group-active:scale-90">
            <div class="w-full h-full bg-blue-600 rounded-full"></div>
          </div>
        </button>
      </div>

      <canvas ref="canvas" class="hidden"></canvas>
    </template>
  </UModal>
</template>
