<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
import IngresarNota from './IngresarNota.vue';
import { useVarView } from '~/stores/varview';

const varView = useVarView()
const props = defineProps({
    notas: {
        type: [Object, Array],
        default: []
    }
});

function agregarNota () {
    varView.showNuevaNota = true
}
</script>

<template>
    <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg py-8 px-12">
        <div v-if="props.notas.length === 0" class="flex justify-center items-center p-5">
            <p>No hay registros de Notas para este paciente</p>
        </div>
        <Tabla v-if="props.notas.length !== 0" :columnas="[
            { titulo: 'fecha_nota', value: 'Fecha', tamaño: 100, ordenar: true },
            { titulo: 'hora_nota', value: 'Hora', tamaño: 100, ordenar: true },
            { titulo: 'nota', value: 'Nota', tamaño: 400 },
            { titulo: 'tipoAnalisis', value: 'Prioridad', tamaño: 200 },
        ]" 
        :headerTabla="{ titulo: 'Notas', color: 'bg-[var(--color-default-600)] text-white', accionAgregar: agregarNota }"
        :datos="{ content: props.notas }" />
    </div>
    <IngresarNota v-if="varView.showNuevaNota"/>
</template>