<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
import AnalisisInfo from '~/components/Forms/Historia/Analisis.vue/AnalisisInfo.vue'
import { Analisis } from '~/data/historias';
import { useVarView } from '~/stores/varview';

const varView = useVarView();

function verAnalisis () {
    varView.showAnalisisInfo = true
}

</script>

<template>
        <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg py-8 px-12">
        <Tabla :columnas="[
            { titulo: 'Fecha', tamaño: 100, ordenar: true },
            { titulo: 'Descripcion', tamaño: 350, ordenar: true },
            { titulo: 'Estado', tamaño: 150 },
        ]" :headerTabla="{ titulo: 'Analisis', color: 'bg-[var(--color-default)] text-white', agregarRuta: agregarHistoria }"
            :acciones="{ action: true, icons: [{icon: 'ver', action: verAnalisis}], botones: true }" :datos="{ content: Analisis }" />
        <AnalisisInfo v-if="varView.showAnalisisInfo"/>
    </div>
</template>