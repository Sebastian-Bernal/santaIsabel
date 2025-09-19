<script setup>
import Titulo from '~/components/atoms/html/Titulo.vue'
import Texto from '~/components/atoms/html/Texto.vue'
import Tabla from '~/components/atoms/html/Tabla.vue'
import Firma from '~/components/atoms/html/Firma.vue'
import Espacio from '~/components/atoms/html/Espacio.vue'
import Imagen from '~/components/atoms/Images/Imagen.vue'
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue'

import { PdfBuilder } from '~/build/Constructores/PDFBuilder'
import { cargarStore } from '../Forms/componentLoader'

const props = defineProps({
    Propiedades: {
        type: [Object],
        required: true
    }

});

const tablaStore = await cargarStore(props.Propiedades.storePinia) || {}

const componentes = {
    Titulo,
    Texto,
    Tabla,
    Espacio,
    Firma,
    Imagen
}

function getValue(obj, path) {
    console.log(obj, path)
    if (!path) return undefined
    return path.split('.').reduce((acc, key) => acc[key], obj)
}

const exportPdf = async () => {
    const pdfBuilder = new PdfBuilder()
        .setElementId(props.Propiedades.elementId)
        .setFileName(props.Propiedades.filename)

    await pdfBuilder.export()
    props.Propiedades.isActive.value = false
}

const cerrar = () => {
    props.Propiedades.isActive.value = false
}

// const elementoId = document.getElementById(props.Propiedades.elementId)
// watch(() => elementoId, (newValue) => {
//     if(unref(props.Propiedades.isActive) && newValue){
//         exportPdf()
//     }
// })
</script>

<template>
    <FondoBlur v-if="unref(props.Propiedades.isActive)">
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7 md:w-[65%] md:h-[80%] w-[90%] h-[90%]">
            <div
                class="w-full flex md:flex-row flex-col justify-between items-center gap-2 py-4 md:px-8 px-2 bg-[var(--color-default)] rounded-t-lg">
                <div>
                    <h2 class="text-white font-bold text-2xl">Vista Previa PDF</h2>
                </div>
                <div class="flex h-full items-center justify-center gap-5 text-xl text-gray-200">
                    <i class="fa-solid fa-download hover:text-white cursor-pointer" @click="exportPdf"></i>
                    <i class="fa-solid fa-close hover:text-white cursor-pointer" @click="cerrar"></i>
                </div>
            </div>
            <!-- Contenido HTML -->
            <div class="scrollForm w-full gap-[15px] h-[100%] overflow-y-auto">
                <div :id="props.Propiedades.elementId" class="p-6 bg-white text-black shadow-md">

                    <component v-for="component in Propiedades.components" :is="componentes[component.tipo]"
                        :Propiedades="{
                            ...component,
                            disabled: true,
                            ...(component.vmodel ? { texto: component.texto + getValue(tablaStore?.Formulario, component.vmodel) } : {}),
                        }" />

                </div>
            </div>

        </div>
    </FondoBlur>
</template>
