<script setup>
defineProps(['Propiedades']);
const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <div class="relative">
    <label>{{ Propiedades.label }}</label>
    <input :list="Propiedades.list" :placeholder="Propiedades.placeholder" class="inputFondo rounded-xl w-full  border border-gray-300 dark:text-white dark:border-blue-900 focus:outline-none shadow-sm focus:ring-blue-500 focus:border-blue-500" @input="$emit('update:modelValue', $event.target.value)"/>
    <i class="fa-solid iconInput absolute left-[10px] top-[47.5%] text-gray-600 dark:text-gray-200" :class="Propiedades.icon"></i>
    </div>
</template>

<style scoped>
.inputFondo {
    padding: 5px 10px 5px 35px;
}

.iconInput {
    transform: translateY(-50%);
}
</style>