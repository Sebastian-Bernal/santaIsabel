<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
import ConsultaInfo from './ConsultaInfo.vue';
import { useVarView } from '~/stores/varview';
import { ref } from 'vue';

const props = defineProps({
    consultas: {
        type: [Array, Object],
        default: [],
    }
});
const consultaAVer = ref([]);
const varView = useVarView();

function verConsulta (consulta) {
    consultaAVer.value = consulta
    varView.showConsultaInfo = true
};
</script>

<template>
    <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg py-8 px-12">
        <div v-if="props.consultas.length < 1" class="flex justify-center items-center p-5">
            <p>No hay registros de consultas para este paciente.</p>
        </div>
        <Tabla v-if="props.consultas.length !== 0" :columnas="[
            { titulo: 'fecha_historia', value: 'Fecha', tamaño: 100, ordenar: true },
            { titulo: 'motivo', value: 'Motivo', tamaño: 250 },
            { titulo: 'name_paciente', value: 'Paciente', tamaño: 250 },
        ]" :headerTabla="{ titulo: 'Consultas', color: 'bg-[var(--color-default-600)] text-white' }"
            :acciones="{ icons: [{ icon: 'ver', action: verConsulta }], botones: true }"
            :datos="{ content: props.consultas }" />
    </div>
    <ConsultaInfo v-if="varView.showConsultaInfo" :consulta="consultaAVer"/>
</template>