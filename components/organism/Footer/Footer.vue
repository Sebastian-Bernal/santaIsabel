<script setup>
const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

</script>

<template>
<footer class="section-footer h-[10px] text-gray-200 flex items-center justify-between px-6">
  <!-- Menú de opciones -->
  <!-- <div class="flex items-center space-x-4">
    <button class="hover:text-white transition">
        <i class="fa-solid fa-gear"></i>
        Ajustes
    </button>
    <button @click="toggleTheme">
      <i class="fa-solid fa-sun"></i>
      {{ colorMode.value }}
    </button>
  </div> -->

  <!-- Derechos reservados -->
  <!-- <div class="text-sm">
    © 2026 Todos los derechos reservados
  </div> -->
</footer>

</template>

<style scoped>
.section-footer {
    grid-area: footer;
}
</style>