<script setup>
import { useVarView } from '~/stores/varview.js';
const varView = useVarView();

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

const cerrar = () => {
    varView.showNuevaHistoria = false;
    varView.showPaso2 = false;
    varView.showPaso3 = false;
    varView.showPaso4 = false;
};
</script>

<template>
    <div
        class="relative w-full flex md:flex-row flex-col justify-between items-center gap-2 py-4 px-8 bg-[var(--color-default)] rounded-t-lg">
        <h2 class="text-white font-bold text-2xl">{{ titulo }}</h2>
        <div class="flex items-center">
            <nuxtLink v-for="(seccion, index) in secciones" :key="index" :to="seccion.ruta" class="flex items-center">
                <button class="md:w-[40px] md:h-[40px] w-[30px] h-[30px] rounded-full" :class="seccion.color">
                    {{ seccion.numPagina }}
                </button>
                <div v-if="seccion.numPagina !== props.secciones.length" class="md:w-[30px] h-[5px] rounded-lg"
                    :class="seccion.color"></div>
            </nuxtLink>
            <i @click="cerrar" class="fa-solid fa-close text-gray-100 hover:text-white pl-4 text-xl cursor-pointer"></i>
        </div>
    </div>
</template>