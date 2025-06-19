<script setup>
defineProps(['label','placeholder','icon','modelValue','list']);
const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <div class="relative">
    <label>{{ label }}</label>
    <input :list="list" :placeholder="placeholder" class="inputFondo rounded-xl w-full bg-gray-100 border border-gray-300" @input="$emit('update:modelValue', $event.target.value)"/>
    <i class="fa-solid iconInput absolute left-[10px] top-[47.5%] text-gray-600" :class="icon"></i>
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