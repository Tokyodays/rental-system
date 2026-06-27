<script setup lang="ts">
definePageMeta({ layout: false })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-slate-900 mb-4">Rent Flow</h1>
      <p class="text-slate-500 mb-8">Vehicle rental management, simplified.</p>
      <NuxtLink to="/login" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
        Sign In
      </NuxtLink>
    </div>
  </div>
</template>
