<script setup>
import Fondo from '../Fondos/Fondo.vue'
import FondoBlanco from '../Fondos/FondoBlanco.vue'
</script>
<template>
    <Fondo>
        <div class="md:w-[70%] md:h-[85%] w-[90%] h-[90%] bg-gray-50 rounded-lg shadow-lg p-6 py-7">
            <slot></slot>
        </div>
    </Fondo>
</template>