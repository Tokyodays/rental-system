<script setup lang="ts">
const isScanning = ref(true)
const scanResult = ref<string | null>(null)

function simulateScan() {
  isScanning.value = false
  scanResult.value = 'MBP-2023-042' // Mock scanned ID
}

function resetScanner() {
  scanResult.value = null
  isScanning.value = true
}

const router = useRouter()
function navigateToVehicle() {
  if (scanResult.value) {
    router.push(`/vehicles`) // In real app, navigate to details
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-160px)] space-y-8">
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">QR Scanner</h1>
      <p class="text-slate-500">Center the QR code within the frame to scan.</p>
    </div>

    <!-- Scanner Box -->
    <div class="relative w-80 h-80 bg-black rounded-3xl overflow-hidden border-4 border-slate-200 dark:border-slate-800 shadow-xl">
      <!-- Camera Placeholder (Simulated) -->
      <div v-if="isScanning" class="absolute inset-0 flex flex-center">
        <div class="w-full h-full bg-slate-900 flex items-center justify-center">
           <UIcon name="i-lucide-camera" class="size-16 text-slate-700 animate-pulse" />
        </div>
        
        <!-- Scanning Overlay -->
        <div class="absolute inset-0 border-[40px] border-black/40"></div>
        <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-bounce"></div>
      </div>

      <!-- Result View -->
      <div v-else class="absolute inset-0 bg-blue-600 flex flex-col items-center justify-center text-white p-6 text-center space-y-4">
        <UIcon name="i-lucide-check-circle" class="size-20" />
        <div>
          <p class="text-blue-100 text-sm uppercase tracking-widest font-bold">Vehicle Identified</p>
          <p class="text-2xl font-black mt-1">{{ scanResult }}</p>
        </div>
        <UButton
          label="Proceed to Action"
          color="neutral"
          variant="solid"
          block
          size="lg"
          @click="navigateToVehicle"
        />
        <UButton
          label="Scan Again"
          color="neutral"
          variant="ghost"
          block
          @click="resetScanner"
        />
      </div>
    </div>

    <!-- Controls -->
    <div v-if="isScanning" class="flex flex-col gap-4 w-full px-4 sm:w-80">
      <UButton
        label="Simulate Scan (Mock)"
        icon="i-lucide-zap"
        color="primary"
        size="lg"
        block
        @click="simulateScan"
      />
      <div class="grid grid-cols-2 gap-2">
        <UButton
          label="Flash"
          icon="i-lucide-zap"
          color="neutral"
          variant="outline"
          block
        />
        <UButton
          label="Albums"
          icon="i-lucide-image"
          color="neutral"
          variant="outline"
          block
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 100% { transform: translateY(-100px); }
  50% { transform: translateY(100px); }
}
.animate-bounce {
  animation: bounce 2s infinite ease-in-out;
}
</style>
