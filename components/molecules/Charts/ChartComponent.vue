<script setup>
const props = defineProps({
    Propiedades: {
        type: Object,
        required: true,
    },
})
console.log(props.Propiedades.datos)
</script>

<template>
  <LineChart
    :data="Propiedades.datos"
    :categories="Propiedades.configuracion.categories"
    :index="Propiedades.configuracion.index"
    :type="Propiedades.configuracion.type"
    :height="300"
    :xLabel="Propiedades.configuracion.xLabel"
    :yLabel="Propiedades.configuracion.yLabel"
    :stacked="true"
    :legend="true"
    :colors="['#3b82f6', '#10b981']"
    :yAxis="{ title: 'Cantidad' }"
    :tooltip="{ enabled: true }"
  />
</template>
