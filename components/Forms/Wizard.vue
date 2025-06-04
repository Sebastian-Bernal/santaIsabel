<script setup>
const props = defineProps({
    secciones: {
        type: [Array]
    }
});
</script>

<template>
    <div class="w-[66%] flex justify-center items-center gap-2 py-5">
        <nuxtLink v-for="(seccion, index) in secciones" :key="index" :to="seccion.ruta" class="flex items-center gap-2">
            <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full" :class="seccion.color">
                {{ seccion.numPagina }}
            </button>
            <div v-if="seccion.numPagina !== props.secciones.length" class="md:w-[100px] h-[5px] rounded-lg" :class="seccion.color"></div>
        </nuxtLink>
        
    </div>
</template>