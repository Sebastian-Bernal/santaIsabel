<script setup>
const props = defineProps({
    color: 'String',
});
</script>

<template>
    <button :class="color"
        class="text-white md:py-2 py-[2px] md:px-4 px-3 font-semibold rounded-xl shadow transition-all duration-300 cursor-pointer active:scale-95">
        <slot></slot>
    </button>
</template>
