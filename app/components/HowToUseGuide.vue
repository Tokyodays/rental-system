<script setup lang="ts">
import { howToUseGuides } from '~/utils/howtouseContent'

const props = defineProps<{ slug: string }>()

const guide = howToUseGuides.find(g => g.slug === props.slug)
const index = howToUseGuides.findIndex(g => g.slug === props.slug)
const prev = computed(() => howToUseGuides[index - 1])
const next = computed(() => howToUseGuides[index + 1])

useHead({ title: guide ? `${guide.title} | How to use` : 'How to use' })
</script>

<template>
  <article v-if="guide" class="max-w-3xl mx-auto space-y-8">
    <div>
      <NuxtLink to="/howtouse" class="text-sm text-blue-600 hover:underline">← How to use</NuxtLink>
      <h1 class="text-2xl font-bold mt-2">{{ guide.title }}</h1>
      <p class="text-slate-500 mt-1">{{ guide.summary }}</p>
    </div>

    <section v-for="section in guide.sections" :key="section.heading" class="space-y-3">
      <h2 class="text-lg font-bold">{{ section.heading }}</h2>
      <p v-if="section.body" class="text-slate-700 dark:text-slate-300">{{ section.body }}</p>
      <ol v-if="section.steps" class="list-decimal pl-6 space-y-1 text-slate-700 dark:text-slate-300">
        <li v-for="s in section.steps" :key="s">{{ s }}</li>
      </ol>
      <ul v-if="section.bullets" class="list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-300">
        <li v-for="b in section.bullets" :key="b">{{ b }}</li>
      </ul>
      <img
        v-if="section.image"
        :src="section.image.src"
        :alt="section.image.alt"
        loading="lazy"
        class="w-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
      >
      <p v-if="section.note" class="text-sm rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 p-3">
        {{ section.note }}
      </p>
    </section>

    <nav class="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-sm">
      <NuxtLink v-if="prev" :to="`/howtouse/${prev.slug}`" class="text-blue-600 hover:underline">← {{ prev.title }}</NuxtLink>
      <span v-else />
      <NuxtLink v-if="next" :to="`/howtouse/${next.slug}`" class="text-blue-600 hover:underline">{{ next.title }} →</NuxtLink>
    </nav>
  </article>
</template>
