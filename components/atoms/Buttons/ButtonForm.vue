<script setup>
const props = defineProps({
    color: 'String',
});
</script>

<template>
    <button :class="color"
        class="md:w-[200px] text-white mt-2 py-2 px-4 font-semibold rounded-xl shadow transition-all duration-300 cursor-pointer active:scale-95">
        <slot></slot>
    </button>
</template>
