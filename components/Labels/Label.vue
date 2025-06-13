<script setup>
const props = defineProps({
    forLabel: {
        type: String,
    },
    size: {
        type: String,
        default: 'text-sm'
    },
    text: 'String',
});
</script>
<template>
    <label :for="forLabel" class="block font-medium text-gray-700 w-fit" :class="size">
        <slot></slot>
    </label>
</template>