<script setup>
import Tabla from '~/components/organism/Table/Tabla.vue'
import Form from '~/components/organism/Forms/Form.vue';
import Calendario from '~/components/molecules/Calendario/Calendario.vue';
import Citas from '~/components/molecules/Calendario/Citas.vue';
import Card from '~/components/molecules/Cards/Card.vue';
import PDFTemplate from '~/components/organism/PDFTemplate/PDFTemplate.vue';

import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import FondoTransparent from '~/components/atoms/Fondos/FondoTransparent.vue';

const props = defineProps({
    Propiedades: {
        default: {}
    }
});

const fondos = {
    FondoBlur,
    FondoTransparent
}

const components = {
    Tabla,
    Form,
    Calendario,
    Citas,
    Card,
    PDFTemplate
}

const seccionActual = ref(0)

function cambiarSeccion(tipo, key) {
    if (tipo === 'Card') {
        seccionActual.value = key + 1
    }
}

function cambiarAInicio() {
    seccionActual.value = 0
}

</script>

<template>
    <component v-if="unref(Propiedades.show)" :is="fondos[Propiedades.fondo]">
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7"
            :class="[Propiedades.estilos, Propiedades.tamaño]">
            <!-- Header Modal -->
            <div
                class="w-full flex md:flex-row flex-col justify-between items-center gap-2 py-4 md:px-8 px-2 bg-[var(--color-default)] rounded-t-lg">
                <div>
                    <h2 class="text-white font-bold text-2xl">{{ Propiedades.headerModal.titulo }}</h2>
                    <div class="flex text-gray-100 font-medium">
                        <span class="text-sm text-gray-100">{{ Propiedades.headerModal.subtitulo }}</span>
                        <span class="text-sm text-gray-100" v-html="Propiedades.headerModal.html"></span>
                    </div>

                </div>
                <div v-if="seccionActual === 0"
                    class="flex h-full items-center justify-center text-xl text-gray-200">
                    <div v-for="icono in Propiedades.headerModal.acciones" @click="icono.accion?.()"
                        class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer">
                        <i class="hover:text-white" :class="icono.icon"></i>
                    </div>
                    <div @click="Propiedades.cerrarModal"
                        class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer">
                        <i class="fa-solid fa-close hover:text-white"></i>
                    </div>
                </div>
                <div v-if="seccionActual > 0" @click="cambiarAInicio"
                    class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer">
                    <i class="fa-solid fa-rotate-left text-gray-200 hover:text-white"></i>
                </div>
            </div>
            <!-- Titulos -->
            <div v-if="Propiedades.header.titulo !== ''" class="md:pb-8 pb-4 flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-semibold">{{ Propiedades.header.titulo }}</h2>
                    <p class="text-gray-600 dark:text-gray-200 mt-1">{{ Propiedades.header.descripcion }}</p>
                </div>

                <div v-if="Propiedades.header.button" class="flex gap-3 items-center cursor-pointer">

                    <div v-for="button in Propiedades.header.button"
                        class="flex gap-2 items-center p-3 rounded-2xl text-white font-semibold" :class="button.color"
                        @click="button.action">
                        <i :class="button.icon"></i>
                        <p class="md:flex hidden">{{ button.text }}</p>
                    </div>

                </div>
            </div>
            <!-- Componentes -->
            <div :class="Propiedades.contenedor">

                <component v-for="(component, index) in Propiedades.secciones[seccionActual].componentes" :key="index"
                    :is="components[component.tipo]" :Propiedades="component"
                    @click="cambiarSeccion(component.tipo, index)" />

                <slot></slot>

            </div>
        </div>
    </component>
</template>