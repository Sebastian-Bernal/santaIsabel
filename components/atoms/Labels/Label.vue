<script setup>
const props = defineProps({
    Propiedades: {
        dafault: {}
    }
});
</script>
<template>
    <label :for="Propiedades.forLabel" class="block font-medium text-gray-700 dark:text-gray-200 w-fit" :class="Propiedades.size">
        <slot></slot>
    </label>
</template>