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
const emit = defineEmits(['update:modelValue']);
</script>
<template>
    <textarea :value="modelValue" :id="Propiedades.id" :name="Propiedades.name" :placeholder="Propiedades.placeholder" @input="$emit('update:modelValue', $event.target.value)" :minlength="Propiedades.minlength" :maxlength="Propiedades.maxlength"
        rows="3"
        class="w-full mt-1 block px-3 py-2 border border-gray-300 dark:text-white dark:border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
    </textarea>
</template>

<style scoped>
textarea:invalid {
  border: 1px solid var(--color-red-500);
}
</style>