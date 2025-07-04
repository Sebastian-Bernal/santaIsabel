<script setup>
const props = defineProps({
    secciones: {
        type: [Array]
    },
    titulo: String,
    cerrar: {
        type: Function,
        default: () => {}
    }
});
</script>

<template>
    <div
        class="relative w-full flex md:flex-row flex-col justify-between items-center gap-2 py-4 px-8 bg-[var(--color-default)] rounded-t-lg">
        <h2 class="text-white font-bold text-2xl">{{ titulo }}</h2>
        <div class="flex items-center pr-5">
            <nuxtLink v-for="(seccion, index) in secciones" :key="index" :to="seccion.ruta" class="flex items-center">
                <button class="md:w-[40px] md:h-[40px] w-[30px] h-[30px] rounded-full" :class="seccion.color">
                    {{ seccion.numPagina }}
                </button>
                <div v-if="seccion.numPagina !== props.secciones.length" class="md:w-[30px] h-[5px] rounded-lg"
                    :class="seccion.color"></div>
            </nuxtLink>
            <div class="cursor-pointer" @click="props.cerrar">
                <i class="fa-solid fa-close text-white position absolute top-7 right-3"></i>
            </div>
        </div>
    </div>
</template>