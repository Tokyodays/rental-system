<script setup lang="ts">
const props = defineProps<{
  images: string[]
}>()

const isOpen = ref(false)
const selectedImage = ref('')

const openImage = (url: string) => {
  selectedImage.value = url
  isOpen.value = true
}
</script>

<template>
  <div class="relative">
    <!-- 画像がない場合 -->
    <div
      v-if="!images || images.length === 0"
      class="aspect-video rounded-xl bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400 border border-gray-200 dark:border-gray-700"
    >
      <UIcon name="i-lucide-image" class="w-12 h-12 mb-2 opacity-20" />
      <span class="text-sm font-medium">写真なし</span>
    </div>

    <!-- カルーセル -->
    <div v-else class="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-gray-50 dark:bg-gray-900 group">
      <UCarousel
        :key="images.join(',')"
        :items="images"
        :arrows="images.length > 1"
        :dots="images.length > 1"
        :prev="{
          icon: 'i-lucide-chevron-left',
          color: 'neutral',
          variant: 'solid',
          class: 'rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity z-20'
        }"
        :next="{
          icon: 'i-lucide-chevron-right',
          color: 'neutral',
          variant: 'solid',
          class: 'rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity z-20'
        }"
        :ui="{
          item: 'basis-full',
          container: 'h-full',
          prev: 'left-4 absolute top-1/2 -translate-y-1/2',
          next: 'right-4 absolute top-1/2 -translate-y-1/2',
          dots: 'bottom-4 absolute inset-x-0 z-20',
          dot: 'size-2 rounded-full transition-all border border-black/10 bg-white/50 data-[state=active]:bg-white data-[state=active]:w-4'
        }"
        class="w-full h-full"
      >
        <template #default="{ item }">
          <img
            :src="item"
            class="w-full h-full object-cover cursor-zoom-in transition-transform hover:scale-105"
            draggable="false"
            @click.stop="openImage(item)"
          >
        </template>
      </UCarousel>
    </div>

    <!-- 拡大表示モーダル -->
    <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-4xl' }">
      <template #content>
        <div class="relative bg-black flex items-center justify-center p-2 min-h-[300px] rounded-lg overflow-hidden">
          <img
            :src="selectedImage"
            class="max-w-full max-h-[85vh] object-contain shadow-2xl"
          />
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            class="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full z-20"
            @click="isOpen = false"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
