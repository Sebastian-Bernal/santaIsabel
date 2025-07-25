<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
import AnalisisInfo from '~/components/Forms/Historia/Analisis.vue/AnalisisInfo.vue'
import { useVarView } from '~/stores/varview';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { ref } from 'vue';

const varView = useVarView();
const historiasStore = useHistoriasStore();
const historiaAnalisis = ref([]);

const props = defineProps({
    analisis: {
        type: [Array, Object],
        default: [],
    }
});

async function verAnalisis(data) {
    historiaAnalisis.value = data
    varView.showAnalisisInfo = true
};

function agregar() {

};
</script>

<template>
    <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg py-8 px-12">
        <div v-if="props.analisis.length < 1" class="flex justify-center items-center p-5">
            <p>No hay registros de Analisis para este paciente.</p>
        </div>
        <Tabla v-if="props.analisis.length !== 0" :columnas="[
            { titulo: 'observacion', value: 'Observación', tamaño: 150 },
            { titulo: 'analisis', value: 'Análisis', tamaño: 250 },
            { titulo: 'tipoAnalisis', value: 'Prioridad', tamaño: 200, ordenar: true },
            { titulo: 'tratamiento', value: 'Tratamiento', tamaño: 100},
        ]" :headerTabla="{ titulo: 'Análisis', color: 'bg-[var(--color-default-600)] text-white' }"
            :acciones="{ icons: [{ icon: 'ver', action: verAnalisis }], botones: true }"
            :datos="{ content: props.analisis }" />
        <AnalisisInfo v-if="varView.showAnalisisInfo" :historiaAnalisis="historiaAnalisis"/>
    </div>
</template>