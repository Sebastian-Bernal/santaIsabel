<script setup>
const props = defineProps({
    Propiedades: {
        default: {
            tamaño: 'w-full'
        }
    },
    modelValue: {
        type: String,
        default: ''
    },
});
const emit = defineEmits(['update:modelValue']);

function onChange(event) {
  emit('update:modelValue', event.target.checked);
}
</script>
<template>
  <label class="flex items-center gap-2 cursor-pointer select-none w-fit" :class="tamaño">
    <div class="relative">
      <input
        type="checkbox"
        :id="Propiedades.id"
        :name="Propiedades.name"
        :checked="modelValue"
        :disabled="Propiedades.disabled"
        class="sr-only"
        @change="onChange"
      />
      <!-- Fondo del switch -->
      <div
        class="block w-8 h-4 rounded-full transition-colors duration-300"
        :class="modelValue ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'"
      ></div>
      <!-- Botón deslizante -->
      <div
        class="absolute left-1 top-0.5 w-3 h-3 bg-white dark:bg-gray-900 rounded-full shadow-md transition-transform duration-300"
        :class="modelValue ? 'translate-x-3' : 'translate-x-0'"
      ></div>
    </div>
    <span>{{ Propiedades.placeholder }}</span>
    </label>
</template>