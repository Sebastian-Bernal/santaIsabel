<script setup>
import Tabla from '~/components/Tables/Tabla.vue';

const props = defineProps({
    tratamientos: {
        type: [Array, Object],
        default: [],
    }
});

</script>

<template>
    <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg py-8 px-12">
        <div v-if="props.tratamientos.length === 0" class="flex justify-center items-center p-5">
            <p>No hay registros de Tratamientos para este paciente</p>
        </div>
        <Tabla v-if="props.tratamientos.length !== 0" :columnas="[
            { titulo: 'descripcion', tamaño: 100, ordenar: true },
            { titulo: 'mes', tamaño: 100, ordenar: true },
            { titulo: 'cantidad', tamaño: 200 },
        ]" :headerTabla="{ titulo: 'Tratamientos', color: 'bg-[var(--color-default)] text-white', agregarRuta: '' }"
            :datos="{ content: props.tratamientos }" />
    </div>
</template>