<script setup>
import Link from '~/components/atoms/Links/Link.vue'
import Tooltip from '~/components/atoms/Tooltips/Tooltip.vue'
import Button from '~/components/atoms/Buttons/Button.vue'
</script>

<template>
  <div class="flex flex-col gap-6 items-start">
    <!-- Link -->
    <Link :Propiedades="{ texto: 'Ir a Google', href: 'https://google.com', target: '_blank' }" />

    <!-- Tooltip -->
    <Tooltip :Propiedades="{ texto: 'Tooltip elegante' }">
      <span class="px-3 py-2 bg-gray-200 rounded-md cursor-pointer">Hover aquí</span>
    </Tooltip>

    <!-- Button -->
    <Button :Propiedades="{ texto: 'Agregar', icon: 'fa-solid fa-plus', events: { onClick: () => console.log('Click!') } }" />
  </div>
</template>
