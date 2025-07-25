<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
import Ingresar from '~/components/Forms/Historia/Ingresar.vue';
import Paso2 from '~/components/Forms/Historia/Paso2.vue';
import Paso3 from '~/components/Forms/Historia/Paso3.vue';
import Paso4 from '~/components/Forms/Historia/Paso4.vue';
import VerHistoria from '~/components/Forms/Historia/VerHistoria.vue';

import { ref, onMounted } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useVarView } from "~/stores/varview.js";

const varView = useVarView();
const historiasStore = useHistoriasStore();

const historiasList = ref([]);
const historia = ref([]);
const refresh = ref(1);

async function llamadatos(){
    const datos = await historiasStore.datosHistoria
    historiasList.value = datos
}

watch(() => varView.showPaso4, async()=>{
    await llamadatos()
    refresh.value++
})

// Cargar los pacientes desde el store
onMounted(async() => {
    varView.cargando = true
    await llamadatos()
    varView.cargando = false
});

// funcion para controlar la visibilidad del formulario de nueva historia clinica
const agregarHistoria = () => {
    varView.showNuevaHistoria = true
};

const actulizarHistoria = () => {
    console.log('actualizar historia');
};

const verHistoria = (his) => {
    historia.value = his;
    if(his.estado === 'Nueva'){
        varView.showNuevaHistoria = true
        return
    }
    varView.showVerHistoria = true
};

const comprobarAccion = (fila) => {
    if(fila.estado === 'Nueva'){
        return 'agregar'
    } else {
        return 'ver'
    }
};

</script>

<template>
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg py-8 px-12">
        <Tabla :key="refresh" :columnas="[
            { titulo: 'cedula', value: 'Cédula', tamaño: 100, ordenar: true },
            { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
            { titulo: 'estado', value: 'Estado', tamaño: 150 },
        ]" :headerTabla="{ titulo: 'Gestion de Historias Clinicas', descripcion: 'Administra y consulta información sobre historias clinicas', color: 'bg-[var(--color-default)] text-white', accionAgregar: agregarHistoria }"
            :acciones="{ icons: [ {icon: comprobarAccion, action: verHistoria} ], botones: true, }" 
            :datos="{ content: historiasList }" />
    </div>
    <Ingresar v-if="varView.showNuevaHistoria" />
    <Paso2 v-if="varView.showPaso2" />
    <Paso3 v-if="varView.showPaso3" />
    <Paso4 v-if="varView.showPaso4" />
    <VerHistoria v-if="varView.showVerHistoria" :historia="historia" />
</template>