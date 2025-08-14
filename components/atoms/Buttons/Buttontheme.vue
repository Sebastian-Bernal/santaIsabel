<script setup lang="ts">
const { theme, toggle } = useTheme()
</script>

<template>
  <button
    class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm shadow
           bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
           text-gray-800 dark:text-gray-100"
    @click="toggle"
  >
    <span v-if="theme === 'dark'"><i class="fa-solid fa-sun"></i></span>
    <span v-else><i class="fa-solid fa-moon"></i></span>
  </button>
</template>
