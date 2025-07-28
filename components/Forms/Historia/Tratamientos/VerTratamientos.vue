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
    <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg md:py-8 py-3 md:px-12 px-4">
        <div v-if="props.tratamientos.length === 0" class="flex justify-center items-center p-5">
            <p>No hay registros de Tratamientos para este paciente</p>
        </div>
        <Tabla v-if="props.tratamientos.length !== 0" :columnas="[
            { titulo: 'descripcion', value: 'Descripción', tamaño: 200, ordenar: true },
            { titulo: 'mes', value: 'Mes', tamaño: 200, ordenar: true },
            { titulo: 'cantidad', value: 'Cantidad', tamaño: 100 },
        ]" :headerTabla="{ titulo: 'Tratamientos', color: 'bg-[var(--color-default-600)] text-white', }"
            :datos="{ content: props.tratamientos, espacioMargen: 450 }" />
    </div>
</template>