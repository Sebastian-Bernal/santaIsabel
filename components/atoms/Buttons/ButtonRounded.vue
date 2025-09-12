<script setup>
const props = defineProps({
    color: 'String',
});
</script>

<template>
    <button type="button" :class="[color, 'cursor-pointer']"
        class="w-[30px] h-[30px] flex justify-center items-center text-white rounded-full hover:opacity-75">
        <slot></slot>
    </button>
</template>