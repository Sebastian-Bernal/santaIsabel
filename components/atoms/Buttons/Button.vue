<script setup>
const props = defineProps({
  Propiedades: {
    type: Object,
    default: () => ({})
  }
});
</script>

<template>
  <button
    :disabled="Propiedades.disabled"
    :class="Propiedades.color, [
      'px-5 py-2 rounded-2xl font-semibold shadow-md transition-all duration-300 cursor-pointer active:scale-95',
      Propiedades.disabled
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-blue-500 hover:bg-blue-600 active:scale-95 text-white',
      Propiedades.clase
    ]"
    @click="Propiedades.events?.onClick"
  >
    <span v-if="Propiedades.icon" class="mr-2">
      <component class="w-5 h-5 inline-block" :class="Propiedades.icon" />
    </span>
    {{ Propiedades.texto }}
    <slot></slot>
  </button>
</template>
