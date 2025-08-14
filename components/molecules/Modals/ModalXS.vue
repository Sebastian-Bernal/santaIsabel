<script setup>
import Fondo from '../Fondos/Fondo.vue';

const props = defineProps({
    color: {
        type: String,
        default: 'bg-gray-50'
    }
});
</script>
<template>
    <Fondo>
        <div class="md:w-[65%] md:h-[70%] w-[90%] h-[90%] rounded-2xl shadow-lg pb-7" :class="props.color">
            <slot></slot>
        </div>
    </Fondo>
</template>