<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
import Ingresar from '~/components/Forms/Historia/Ingresar.vue';

import { ref, onMounted } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useVarView } from "~/stores/varview.js";

const varView = useVarView();
const historiasStore = useHistoriasStore();
const { Historias } = historiasStore;
const historiasList = ref([]);

// Cargar los pacientes desde el store
onMounted(() => {
    historiasList.value = Historias
});

// funcion para controlar la visibilidad del formulario de nueva historia clinica
const agregarHistoria = () => {
    varView.showNuevaHistoria = true
};

const actulizarHistoria = () => {
    console.log('sisas')
};
</script>

<template>
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg p-6 py-7">
        <Tabla :columnas="[
            { titulo: 'paciente', tamaño: 150, ordenar: true },
            { titulo: 'fecha', tamaño: 100, ordenar: true },
            { titulo: 'doctor', tamaño: 100 },
            { titulo: 'consulta', tamaño: 200 },
            { titulo: 'diagnstico', tamaño: 150 },
            { titulo: 'estado', tamaño: 150 }
        ]" :headerTabla="{ titulo: 'Gestion de Historias Clinicas', descripcion: 'Administra y consulta información sobre historias clinicas', color: 'bg-[var(--color-default)] text-white', agregarRuta: agregarHistoria }"
            :acciones="{ action: true, icons: [{icon: 'actualizar', action: actulizarHistoria}], botones: true }" :datos="{ content: historiasList }" />
    </div>
    <Ingresar v-if="varView.showNuevaHistoria" />
</template>