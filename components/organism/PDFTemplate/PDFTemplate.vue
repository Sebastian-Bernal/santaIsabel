<script setup>
import Titulo from '~/components/atoms/html/Titulo.vue'
import Texto from '~/components/atoms/html/Texto.vue'
import Tabla from '~/components/atoms/html/Tabla.vue'
import Firma from '~/components/atoms/html/Firma.vue'
import Espacio from '~/components/atoms/html/Espacio.vue'
import Imagen from '~/components/atoms/Images/Imagen.vue'
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue'
import PDF from '~/components/organism/PDFTemplate/PDF.vue'

import { PdfBuilder } from '~/build/Constructores/PDFBuilder'
import { cargarStore } from '../Forms/componentLoader'

const varView = useVarView()
const imprimir = ref(false)
const props = defineProps({
    Propiedades: {
        type: [Object],
        required: true
    }

});

const tablaStore = await cargarStore(props.Propiedades.storePinia) || {}
const showDropdown = ref(false);
const config = ref({
    format: "a4",
    orientation: "p", // p = portrait, l = landscape
    margin: 10,
    background: true,
});

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const cerrarDropdown = () => {
    showDropdown.value = false;
};

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

// const exportPdf = async () => {
//     const pdfBuilder = new PdfBuilder()
//         .setElementId(props.Propiedades.elementId)
//         .setFileName(props.Propiedades.filename)
//         .setFormat(config.value.format)
//         .setOrientation(config.value.orientation)
//         .setMargins(config.value.margin)
//         .setSello(props.Propiedades.sello)

//     await pdfBuilder.export()


//     cerrarDropdown()
//     props.Propiedades.isActive.value = false
// }
const exportPdf = async () => {
    varView.propiedadesPDF = props.Propiedades
    imprimir.value = true
    window.onafterprint = () => {
        imprimir.value = false;   // cerrar impresión
        cerrarDropdown()
        props.Propiedades.isActive.value = false
    };

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
    <PDF v-if="imprimir"></PDF>
    <FondoBlur v-if="unref(props.Propiedades.isActive) && !imprimir">
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7 md:w-[65%] md:h-[80%] w-[90%] h-[90%]">
            <div
                class="w-full flex md:flex-row flex-col justify-between items-center gap-2 py-4 md:px-8 px-2 bg-[var(--color-default)] rounded-t-lg">
                <div>
                    <h2 class="text-white font-bold text-2xl">Vista previa del PDF</h2>
                </div>
                <div class="flex h-full items-center justify-center text-xl text-gray-200">
                    <div class="relative drop" @mouseleave="cerrarDropdown">
                        <div
                            class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer">
                            <i class="fa-solid fa-download hover:text-white"></i>
                        </div>
                        <div
                            class="dropdownAjuste absolute left-[-50%] top-[100%] bg-[var(--color-default-500)] z-9 gap-2 items-center justify-center rounded-b-lg">
                            <p class="flex gap-1 items-center text-xs px-4 py-3 cursor-pointer text-gray-200 hover:text-white" v-if="!showDropdown" @click="exportPdf"><i class="fa-solid fa-download"></i>Descargar</p>
                            <p class="flex gap-1 items-center text-xs px-4 py-3 cursor-pointer text-gray-200 hover:text-white" v-if="!showDropdown" @click="toggleDropdown"><i class="fa-solid fa-gear"></i>Configurar</p>
                            <div v-if="showDropdown"
                                class=" w-56 bg-white shadow-lg rounded-lg p-4 z-50 text-gray-700">
                                <h3 class="font-semibold text-sm mb-2">Configuración PDF</h3>

                                <!-- Formato -->
                                <label class="flex items-center justify-between mb-2 text-sm">
                                    Formato:
                                    <select v-model="config.format" class="border rounded px-1 py-0.5 text-sm">
                                        <option value="a4">A4</option>
                                        <option value="letter">Letter</option>
                                    </select>
                                </label>

                                <!-- Orientación -->
                                <label class="flex items-center justify-between mb-2 text-sm">
                                    Orientación:
                                    <select v-model="config.orientation" class="border rounded px-1 py-0.5 text-sm">
                                        <option value="p">Vertical</option>
                                        <option value="l">Horizontal</option>
                                    </select>
                                </label>

                                <!-- Márgenes -->
                                <label class="flex items-center justify-between mb-2 text-sm">
                                    Márgenes:
                                    <input type="number" v-model="config.margin"
                                        class="border rounded px-1 py-0.5 w-16 text-sm" min="0" /> mm
                                </label>

                                <!-- Incluir fondo -->
                                <label class="flex items-center mb-2 text-sm">
                                    <input type="checkbox" v-model="config.background" class="mr-2">
                                    Incluir fondo
                                </label>

                                <!-- Botón exportar -->
                                <button class="w-full bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700"
                                    @click="exportPdf">
                                    Generar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                    <div @click="cerrar"
                        class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer">
                        <i class="fa-solid fa-close hover:text-white"></i>
                    </div>
                </div>
            </div>
            <!-- Contenido HTML -->
            <div class="scrollForm w-full gap-[15px] max-h-[90%] overflow-y-auto">
                <div class="p-6 bg-white text-black shadow-md">

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
    <!-- <div :id="props.Propiedades.elementId"
        style="width: 794px; margin-bottom: 25px; background: white; position: absolute; top: -9999px; left: -9999px; color: black;">

        <component v-for="component in Propiedades.components" :is="componentes[component.tipo]" :Propiedades="{
            ...component,
            disabled: true,
            ...(component.vmodel ? { texto: component.texto + getValue(tablaStore?.Formulario, component.vmodel) } : {}),
        }" />

    </div> -->
</template>

<style scoped>
.dropdownAjuste {
    opacity: 0;
    pointer-events: none;
    transform: translateX(0) translateY(-10%);
    transition: all 0.3s ease;
}

.drop:hover .dropdownAjuste {
    opacity: 1;
    pointer-events: all;
    transform: translateX(0) translateY(0);
}
</style>
