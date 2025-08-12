<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
import IngresarNota from './IngresarNota.vue';
import NotaInfo from './NotaInfo.vue';
import { useVarView } from '~/stores/varview';

const varView = useVarView()
const notaInfo = ref({});
const props = defineProps({
    notas: {
        type: [Object, Array],
        default: []
    }
});

function agregarNota () {
    varView.showNuevaNota = true
};

async function verNota(data) {
    notaInfo.value = data
    varView.showNotasInfo = true
};

const comprobarPrioridad = (fila) => {
    if(fila.tipoAnalisis === 'Cambios criticos'){
        return 'Rojo'
    } else if(fila.tipoAnalisis === 'Recomendaciones Adicionales') {
        return 'Naranja'
    } else if(fila.tipoAnalisis === 'Estado clinico sin cambios') {
        return 'Verde'
    }
};
</script>

<template>
    <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg md:py-8 py-3 md:px-12 px-4">
        <Tabla :columnas="[
            { titulo: 'fecha_nota', value: 'Fecha', tamaño: 100, ordenar: true },
            { titulo: 'hora_nota', value: 'Hora', tamaño: 100, ordenar: true },
            { titulo: 'nota', value: 'Nota', tamaño: 400 },
            { titulo: 'tipoAnalisis', value: 'Prioridad', tamaño: 200 },
        ]" 
        :headerTabla="{ titulo: 'Notas', color: 'bg-[var(--color-default-600)] text-white', accionAgregar: agregarNota }"
        :acciones="{ icons: [{ icon: comprobarPrioridad, action: () => {} }, { icon: 'ver', action: verNota }], botones: true }"
        :datos="{ content: props.notas, espacioMargen: 450 }" />
    </div>
    <IngresarNota v-if="varView.showNuevaNota"/>
    <NotaInfo v-if="varView.showNotasInfo" :notaInfo="notaInfo"/>
</template>