<script setup>
import Fondo from '../Fondos/Fondo.vue';

</script>
<template>
    <Fondo>
        <div class="md:w-[70%] md:h-[85%] w-[90%] h-[90%] bg-gray-50 rounded-2xl shadow-lg pb-7">
            <slot></slot>
        </div>
    </Fondo>
</template>