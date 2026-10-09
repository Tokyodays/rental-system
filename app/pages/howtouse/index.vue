<script setup lang="ts">
import { howToUseGuides, howToUseIndex } from '~/utils/howtouseContent'

useHead({ title: howToUseIndex.title })
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold">{{ howToUseIndex.title }}</h1>
      <p class="text-slate-500 mt-1">{{ howToUseIndex.summary }}</p>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="g in howToUseGuides"
        :key="g.slug"
        :to="`/howtouse/${g.slug}`"
        class="flex gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-colors"
      >
        <UIcon :name="g.icon" class="size-6 text-blue-600 shrink-0" />
        <div>
          <p class="font-semibold">{{ g.title }}</p>
          <p class="text-sm text-slate-500">{{ g.summary }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
