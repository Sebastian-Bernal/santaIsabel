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

// Cargar los pacientes desde el store
onMounted(async() => {
    varView.cargando = true
    const datos = await historiasStore.datosHistoria
    historiasList.value = datos
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
    varView.showVerHistoria = true
};
</script>

<template>
    <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg shadow-lg py-8 px-12">
        <Tabla :columnas="[
            { titulo: 'cedula', tamaño: 100, ordenar: true },
            { titulo: 'paciente', tamaño: 150, ordenar: true },
            { titulo: 'estado', tamaño: 150 },
        ]" :headerTabla="{ titulo: 'Gestion de Historias Clinicas', descripcion: 'Administra y consulta información sobre historias clinicas', color: 'bg-[var(--color-default)] text-white', agregarRuta: agregarHistoria }"
            :acciones="{ action: true, icons: [{icon: 'ver', action: verHistoria}], botones: true }" :datos="{ content: historiasList }" />
    </div>
    <Ingresar v-if="varView.showNuevaHistoria" />
    <Paso2 v-if="varView.showPaso2" />
    <Paso3 v-if="varView.showPaso3" />
    <Paso4 v-if="varView.showPaso4" />
    <VerHistoria v-if="varView.showVerHistoria" :historia="historia" :actions="actions" />
</template>