<script setup>
import FondoBlur from '../atoms/Fondos/FondoBlur.vue';

const props = defineProps({
    color: {
        type: String,
        default: 'bg-gray-50'
    }
});
</script>
<template>
    <FondoBlur>
        <div class="md:w-[65%] md:h-[70%] w-[90%] h-[90%] rounded-2xl shadow-lg pb-7" :class="props.color">
            <slot></slot>
        </div>
    </FondoBlur>
</template>