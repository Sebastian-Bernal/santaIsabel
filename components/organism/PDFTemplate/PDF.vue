<script setup>
import Titulo from '~/components/atoms/html/Titulo.vue'
import Texto from '~/components/atoms/html/Texto.vue'
import Tabla from '~/components/atoms/html/Tabla.vue'
import Firma from '~/components/atoms/html/Firma.vue'
import Espacio from '~/components/atoms/html/Espacio.vue'
import Imagen from '~/components/atoms/Images/Imagen.vue'

definePageMeta({
    layout: 'impresion'
})

const varView = useVarView()

onMounted(() => {
    console.log(varView.propiedadesPDF)
    document.title = varView.propiedadesPDF.filename;
    window.print()
})

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
</script>

<template>
    <div class="absolute inset-0 bg-white text-black px-8 py-5 h-[100vh] z-999">
        <component v-for="component in varView.propiedadesPDF.components" :is="componentes[component.tipo]" :Propiedades="{
            ...component,
            disabled: true,
            ...(component.vmodel ? { texto: component.texto + getValue(tablaStore?.Formulario, component.vmodel) } : {}),
        }" />
    </div>
</template>