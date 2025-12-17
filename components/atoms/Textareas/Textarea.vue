<script setup>
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    Propiedades: {
        default: {}
    }
});

function handleInput(event) {
  let value = event.target.value;

  // Aplica transformación solo si se especifica
  if (props.Propiedades.upperCase === true) {
    value = value.toUpperCase();
  } else if (props.Propiedades.lowerCase === true) {
    value = value.toLowerCase();
  }

  // Emitimos el valor transformado (o sin transformar)
  emit('update:modelValue', value);
}

const emit = defineEmits(['update:modelValue']);
</script>
<template>
    <textarea :value="modelValue" lang="es" spellcheck="true" autocorrect="on" autocomplete="on"
    :id="Propiedades.id" 
    :name="Propiedades.name" 
    :placeholder="Propiedades.placeholder" 
    :disabled="Propiedades.disabled"
    @input="handleInput($event); Propiedades.events?.onInput?.($event)" 
    :minlength="Propiedades.minlength" :maxlength="Propiedades.maxlength"
    @click="Propiedades.events?.onClick"
    @change="Propiedades.events?.onChange"
    @blur="Propiedades.events?.onBlur"
    @keyup.enter="Propiedades.events?.onKeyUp"
        rows="3"
        :class="Propiedades.tamaño"
        class="w-full mt-1 block px-3 py-2 border border-gray-300 dark:text-white dark:border-blue-900 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
    </textarea>
</template>

<style scoped>
textarea:invalid {
  border: 1px solid var(--color-red-500);
}
</style>