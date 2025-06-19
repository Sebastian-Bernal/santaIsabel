<script setup>
const props = defineProps({
    secciones: {
        type: [Array]
    },
    titulo: String,
});
</script>

<template>
    <div class="w-full flex justify-between items-center gap-2 py-4 px-8 bg-[var(--color-default)] rounded-t-2xl">
        <h2 class="text-white font-bold text-2xl">{{ titulo }}</h2>
        <div class="flex items-center ">
        <nuxtLink v-for="(seccion, index) in secciones" :key="index" :to="seccion.ruta" class="flex items-center">
            <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full" :class="seccion.color">
                {{ seccion.numPagina }}
            </button>
            <div v-if="seccion.numPagina !== props.secciones.length" class="md:w-[50px] h-[5px] rounded-lg" :class="seccion.color"></div>
        </nuxtLink>
        </div>
        
    </div>
</template>