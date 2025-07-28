<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
import Medicinas from '../Medicinas.vue';
const varView = useVarView()
const props = defineProps({
    medicinas: {
        type: [Array, Object],
        default: [],
    }
});

function añadirMedicamento () {
    varView.showMedicinas = true
};

</script>

<template>
    <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg md:py-8 py-3 md:px-12 px-4">
        <div v-if="props.medicinas.length === 0" class="flex justify-center items-center p-5">
            <p>No hay registros de Medicacion para este paciente</p>
        </div>
        <Tabla v-if="props.medicinas.length !== 0" :columnas="[
            { titulo: 'medicamento', value: 'Medicamento', tamaño: 100, ordenar: true },
            { titulo: 'presentacion', value: 'Presentación', tamaño: 100, ordenar: true },
            { titulo: 'concentracion', value: 'Concentracíón', tamaño: 100 },
            { titulo: 'cantidad', value: 'Cantidad', tamaño: 100 },
            { titulo: 'dosis', value: 'Dosis', tamaño: 100 },
        ]" :headerTabla="{ titulo: 'Medicacion', color: 'bg-[var(--color-default-600)] text-white', }"
            :datos="{ content: props.medicinas, espacioMargen: 450 }" />
    </div>
    <Medicinas v-if="varView.showMedicinas"/>
</template>