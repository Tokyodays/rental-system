<script setup lang="ts">
const emit = defineEmits<{
  (e: 'capture', blob: Blob): void
  (e: 'close'): void
}>()

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
    error.value = 'カメラへのアクセスが拒否されたか、利用できません。'
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
  
  c.toBlob((blob) => {
    if (blob) {
      emit('capture', blob)
      stopCamera()
    }
  }, 'image/webp', 0.8)
}

// カメラの停止
const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  isPlaying.value = false
}

onMounted(() => {
  startCamera()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <div class="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center">
    <!-- ヘッダー -->
    <div class="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
      <h3 class="text-white font-medium">写真を撮影</h3>
      <UButton
        type="button"
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        class="rounded-full bg-white/10"
        @click="$emit('close')"
      />
    </div>

    <!-- ビデオプレビュー -->
    <div class="relative w-full h-full flex items-center justify-center overflow-hidden">
      <video
        ref="video"
        autoplay
        playsinline
        class="w-full h-full object-cover"
      ></video>
      
      <!-- ガイドライン -->
      <div class="absolute inset-0 pointer-events-none border-[2px] border-white/20 m-12 rounded-lg"></div>

      <!-- エラー表示 -->
      <div v-if="error" class="absolute inset-0 flex items-center justify-center p-6 text-center">
        <div class="bg-white/10 backdrop-blur-md p-6 rounded-2xl max-w-xs">
          <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-400 mb-3 mx-auto" />
          <p class="text-white text-sm">{{ error }}</p>
          <UButton
            type="button"
            label="閉じる"
            variant="soft"
            color="neutral"
            class="mt-4"
            @click="$emit('close')"
          />
        </div>
      </div>
    </div>

    <!-- コントロール -->
    <div class="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-around bg-gradient-to-t from-black/50 to-transparent">
      <div class="w-12 h-12"></div> <!-- スペーサー -->
      
      <button
        type="button"
        class="group relative flex items-center justify-center"
        @click="takePhoto"
        :disabled="!isPlaying"
      >
        <div class="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 transition-transform group-active:scale-90">
          <div class="w-full h-full bg-white rounded-full"></div>
        </div>
      </button>

      <div class="w-12 h-12 flex items-center justify-center">
        <!-- ファイルから選択への切り替えも可能にするならここに -->
      </div>
    </div>

    <canvas ref="canvas" class="hidden"></canvas>
  </div>
</template>
