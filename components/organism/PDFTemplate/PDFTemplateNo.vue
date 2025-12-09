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

definePageMeta({
    layout: 'impresion'
})

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

const exportPdf = async () => {
    const pdfBuilder = new PdfBuilder()
        .setElementId(props.Propiedades.elementId)
        .setFileName(props.Propiedades.filename)
        .setFormat(config.value.format)
        .setOrientation(config.value.orientation)
        .setMargins(config.value.margin)
        .setSello(props.Propiedades.sello)

    await pdfBuilder.export()


    cerrarDropdown()
    props.Propiedades.isActive.value = false
}

const cerrar = () => {
    props.Propiedades.isActive.value = false
}

// onMounted(() => {
//     window.print()
// })
// const elementoId = document.getElementById(props.Propiedades.elementId)
// watch(() => elementoId, (newValue) => {
//     if(unref(props.Propiedades.isActive) && newValue){
//         exportPdf()
//     }
// })
</script>

<template>
    <div v-if="unref(props.Propiedades.isActive)">
        <component v-for="component in Propiedades.components" :is="componentes[component.tipo]" :Propiedades="{
            ...component,
            disabled: true,
            ...(component.vmodel ? { texto: component.texto + getValue(tablaStore?.Formulario, component.vmodel) } : {}),
        }" />
    </div>
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

.ocultarPDF {
    position: absolute;
    top: -9999px;
    left: -9999px;
}
</style>
