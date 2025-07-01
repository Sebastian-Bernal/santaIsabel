<script setup>
const props = defineProps({
    options: {
        type: Array,
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
    showInfoSelect:{
        type: Boolean,
        default: false
    }

});
const emit = defineEmits(['update:modelValue']);
</script>
<template>
    <select v-if="showInfoSelect" :value="modelValue" :name="name" :id="id" :class="tamaño" @input="$emit('update:modelValue', $event.target.value)"
        class="mt-1 text-gray-900 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        <option value="" selected>{{ placeholder }}</option>
        <option v-for="option in options" :value="option.value">{{ option.text }}</option>
    </select>
    <select v-if="!showInfoSelect" :value="modelValue" :name="name" :id="id" :class="tamaño" @input="$emit('update:modelValue', $event.target.value)"
        class="mt-1 text-gray-900 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        <option value="" selected disabled hidden>{{ placeholder }}</option>
        <option v-for="option in options" :value="option.value">{{ option.text }}</option>
    </select>
</template>