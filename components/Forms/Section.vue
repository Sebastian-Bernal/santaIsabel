<script setup>
const props = defineProps({
    styles: 'String',
});
</script>
<template>
    <div class="md:w-5/6 w-full">
        <div class="flex justify-between items-start gap-3 w-full" :class="styles">
            <slot></slot>
        </div>
    </div>
</template>