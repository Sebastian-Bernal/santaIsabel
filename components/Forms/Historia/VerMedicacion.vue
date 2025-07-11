<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
const Medicacion = [];

const props = defineProps({
    medicinas: {
        type: [Array, Object],
        default: [],
    }
});

function verMedicamento () {

}

</script>

<template>
    <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg py-8 px-12">
        <div v-if="props.medicinas.length === 0" class="flex justify-center items-center p-5">
            <p>No hay registros de Medicacion para este paciente</p>
        </div>
        <Tabla v-if="props.medicinas.length !== 0" :columnas="[
            { titulo: 'medicamento', tamaño: 100, ordenar: true },
            { titulo: 'presentacion', tamaño: 100, ordenar: true },
            { titulo: 'concentracion', tamaño: 100 },
            { titulo: 'concentracion', tamaño: 100 },
            { titulo: 'cantidad', tamaño: 100 },
            { titulo: 'dosis', tamaño: 100 },
        ]" :headerTabla="{ titulo: 'Medicacion', color: 'bg-[var(--color-default)] text-white', agregarRuta: verMedicamento }"
            :acciones="{ action: true, icons: [{ icon: 'ver', action: verMedicamento }], botones: true }"
            :datos="{ content: props.medicinas }" />
    </div>
</template>