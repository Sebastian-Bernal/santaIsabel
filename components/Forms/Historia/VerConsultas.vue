<script setup>
import Tabla from '~/components/Tables/Tabla.vue';

const props = defineProps({
    consultas: {
        type: [Array, Object],
        default: [],
    }
});

function verConsulta () {

}
</script>

<template>
    <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg py-8 px-12">
        <div v-if="props.consultas.length < 1" class="flex justify-center items-center p-5">
            <p>No hay registros de consultas para este paciente.</p>
        </div>
        <Tabla v-if="props.consultas.length !== 0" :columnas="[
            { titulo: 'fecha_historia', tamaño: 100, ordenar: true },
            { titulo: 'analisis', tamaño: 200, ordenar: true },
            { titulo: 'motivo', tamaño: 200 },
            { titulo: 'tipoAnalisis', tamaño: 250 },
        ]" :headerTabla="{ titulo: 'Consultas', color: 'bg-[var(--color-default)] text-white', agregarRuta: verConsulta }"
            :acciones="{ action: true, icons: [{ icon: 'ver', action: verConsulta }], botones: true }"
            :datos="{ content: props.consultas }" />
    </div>
</template>