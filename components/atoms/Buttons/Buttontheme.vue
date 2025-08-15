<script setup>
const { theme, toggle, apply } = useTheme()
</script>

<template>
  <button
    class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm shadow
           text-gray-300 dark:text-gray-100"
    @click="toggle"
  >
    <span v-if="theme.value === 'dark'"><i class="fa-solid fa-sun"></i></span>
    <span v-else><i class="fa-solid fa-moon"></i></span>
  </button>
</template>
