<script setup>
const props = defineProps({
    color: 'String',
});
</script>

<template>
    <button :class="color"
        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
        <slot></slot>
    </button>
</template>
