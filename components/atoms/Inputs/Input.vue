<script setup>
const props = defineProps({
    type: {
        type: String,
        default: 'text'
    },
    id: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    placeholder: {
        type: String,
        default: ''
    },
    tamaño: {
        type: [String, Object, Array],
        default: 'w-full'
    },
    modelValue: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    maxlength: {
        type: String
    },
    minlength: {
        type: String
    },
    mayuscula: {
        type: Boolean,
        default: true
    }
});
const emit = defineEmits(['update:modelValue']);
</script>
<template>
    <input :value="modelValue" autocomplete="off" :type="type" :id="id" :name="name" :maxlength="maxlength" :minlength="minlength" :placeholder="placeholder" @input="$emit('update:modelValue', mayuscula ? $event.target.value.toUpperCase() : $event.target.value)" :class="tamaño" :disabled="disabled"
        class="mt-1 block px-3 py-2 border text-black border-gray-300 dark:text-white dark:border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
</template>

<style scoped>
.incompleto {
    border: 1px solid var(--color-red-500);
}
input:invalid {
  border: 1px solid var(--color-red-500);
}
</style>