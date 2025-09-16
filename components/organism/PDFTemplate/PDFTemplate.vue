<script setup>
import { PdfBuilder } from '~/build/Constructores/PDFBuilder'
import Titulo from '~/components/atoms/html/Titulo.vue'
import Texto from '~/components/atoms/html/Texto.vue'
import Tabla from '~/components/atoms/html/Tabla.vue'
import { cargarStore } from '../Forms/componentLoader'

const props = defineProps({
    Propiedades: {
        type: [Object],
        required: true
    }

})

const tablaStore = await cargarStore(props.Propiedades.storePinia) || {}

const componentes = {
    Titulo,
    Texto,
    Tabla
}

function getValue(obj, path) {
    if (!path) return undefined
    return path.split('.').reduce((acc, key) => acc[key], obj)
}

const exportPdf = async () => {
    const pdfBuilder = new PdfBuilder()
        .setElementId(props.Propiedades.elementId)
        .setFileName(props.Propiedades.filename)

    await pdfBuilder.export()
}
</script>

<template>
    <div>
        <!-- Contenido HTML -->
        <div :id="props.Propiedades.elementId" class="p-6 bg-white text-black shadow-md rounded-lg">

            <component v-for="component in Propiedades.components" 
                :is="componentes[component.tipo]"
                :Propiedades="{ ...component, 
                    disabled: true, 
                    ...(component.vmodel ? { texto: component.texto + getValue(tablaStore?.Formulario, component.vmodel) } : {}),
                    }"
            />

        </div>

        <!-- Botón de exportación -->
        <button @click="exportPdf" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Exportar a PDF
        </button>

    </div>
</template>
