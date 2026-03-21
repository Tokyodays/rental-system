<script setup lang="ts">
defineProps<{
  title: string
}>()

const emit = defineEmits(['toggle-sidebar'])
</script>

<template>
  <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
    <div class="flex items-center gap-4">
      <UButton
        icon="i-lucide-menu"
        variant="ghost"
        color="neutral"
        class="md:hidden cursor-pointer"
        @click="emit('toggle-sidebar')"
      />
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ title }}</h2>
    </div>

    <div class="flex items-center gap-4">
      <UButton
        icon="i-lucide-notifications"
        variant="ghost"
        color="neutral"
        class="relative cursor-pointer"
      >
        <span class="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full"></span>
      </UButton>

      <!-- User Profile -->
      <UDropdownMenu :items="[[{ label: 'Profile', icon: 'i-lucide-user' }, { label: 'Logout', icon: 'i-lucide-log-out', color: 'error' }]]">
        <UAvatar
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnl5K-isI96o9PdqQJEgTsBc2W2YGOpT5BStFOmTGsUidCdncENUhhcqeWSSWROguIuYc_X-nMYK4hn3BXkvsPhHOq9xpCt_voI2q29zswt88eV9FbMNZDG1IIztHOC_o9IHPHnKbw5Ibslw-kaLC-F3CAoP1iufzX0dXbF7EN_ClxY8HvltXxIEk6q1qa6Uh1UlU7PDBKL28DHh2eti8bO8__T3RwRzjvvQmkYase89UXYjljXO8f-UGI0fpPSJd7BOr537xHC5Dm"
          alt="User"
          class="cursor-pointer"
        />
      </UDropdownMenu>
    </div>
  </header>
</template>
