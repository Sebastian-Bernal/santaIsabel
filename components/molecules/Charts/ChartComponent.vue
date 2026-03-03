<script setup>
const props = defineProps({
    Propiedades: {
        type: Object,
        required: true,
    },
})

</script>

<template>
  <LineChart
    :data="Propiedades.datos"
    :categories="Propiedades.configuracion.categories"
    :index="Propiedades.configuracion.index"
    :type="Propiedades.configuracion.type"
    :height="Propiedades.configuracion.height"
    :xLabel="Propiedades.configuracion.xLabel"
    :yLabel="Propiedades.configuracion.yLabel"
    :stacked="true"
    :legend="true"
    :colors="['#3b82f6', '#10b981']"
    :yAxis="Propiedades.configuracion.yAxis"
    :tooltip="{ enabled: true }"
  />
</template>
