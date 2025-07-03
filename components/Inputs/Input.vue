<script setup>
const props = defineProps({
    type: {
        type: String,
        default: 'text'
    },
    id: {
        type: String,
        required: true
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
        type: String,
        default: 'w-full'
    },
    modelValue: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['update:modelValue']);
</script>
<template>
    <input v-if="!disabled" :value="modelValue" autocomplete="off" :type="type" :id="id" :name="name" :placeholder="placeholder" @input="$emit('update:modelValue', $event.target.value)" :class="tamaño" 
        class="mt-1 block px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
</template>