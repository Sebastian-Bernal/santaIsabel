<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
import AnalisisInfo from '~/components/Forms/Historia/Analisis.vue/AnalisisInfo.vue'
import { Analisis } from '~/data/historias';
import { useVarView } from '~/stores/varview';

const varView = useVarView();

const props = defineProps({
    analisis: {
        type: [Array, Object],
        default: [],
    }
});

function verAnalisis () {
    varView.showAnalisisInfo = true
};

function agregar () {

};
</script>

<template>
        <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg py-8 px-12">
        <Tabla :columnas="[
            { titulo: 'analisis', tamaño: 350, ordenar: true },
            { titulo: 'tratamiento', tamaño: 350, ordenar: true },
        ]" :headerTabla="{ titulo: 'Analisis', color: 'bg-[var(--color-default)] text-white', agregarRuta: agregar }"
            :acciones="{ action: true, icons: [{icon: 'ver', action: verAnalisis}], botones: true }" :datos="{ content: props.analisis }" />
        <AnalisisInfo v-if="varView.showAnalisisInfo"/>
    </div>
</template>