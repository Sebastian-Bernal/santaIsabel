<script setup>
const props = defineProps({
    rows: {
        type: String,
        default: '2'
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
    modelValue: {
        type: String,
        default: ''
    }
});
const emit = defineEmits(['update:modelValue']);
</script>
<template>
    <textarea :value="modelValue" :id="id" :name="name" :placeholder="placeholder" @input="$emit('update:modelValue', $event.target.value)"
        rows="3"
        class="w-full mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
    </textarea>
</template>