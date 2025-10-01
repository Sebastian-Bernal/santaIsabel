<script setup>
const props = defineProps({
  Propiedades: {
    type: Object,
    default: () => ({})
  },
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

function onChange(event) {
  emit('update:modelValue', event.target.value);
}
</script>

<template>
  <label
    class="flex items-center gap-2 cursor-pointer select-none w-fit"
    :class="Propiedades.tamaño"
  >
    <div class="relative">
      <input
        type="radio"
        :id="Propiedades.id"
        :name="Propiedades.name"
        :value="Propiedades.value"
        :checked="modelValue === Propiedades.value"
        :disabled="Propiedades.disabled"
        class="sr-only"
        @change="onChange"
        @click="Propiedades.events?.onClick"
        @blur="Propiedades.events?.onBlur"
        @keyup.enter="Propiedades.events?.onKeyUp"
      />
      <!-- Círculo exterior -->
      <div
        class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300"
        :class="modelValue === Propiedades.value ? 'border-blue-500' : 'border-gray-400 dark:border-gray-600'"
      >
        <!-- Círculo interior -->
        <div
          class="w-3 h-3 rounded-full transition-all duration-300"
          :class="modelValue === Propiedades.value ? 'bg-blue-500 scale-100' : 'scale-0'"
        ></div>
      </div>
    </div>
    <span class="text-black dark:text-white">{{ Propiedades.placeholder }}</span>
  </label>
</template>
