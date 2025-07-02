<script setup>
import Tabla from '../../components/Tables/Tabla.vue';
import IngresarPaciente from '../../components/Forms/Pacientes/IngresarPaciente.vue';
import ModificarPaciente from '../../components/Forms/Pacientes/ModificarPaciente.vue';

import { ref, onMounted } from 'vue';
import { usePacientesStore } from '../../stores/Formularios/paciente/Paciente.js';
import {useVarView} from '../../stores/varview.js';

const varView = useVarView();
const pacientesStore = usePacientesStore();
const { listPacientes } = pacientesStore;
const pacientes = ref([]);

// Cargar los pacientes desde el store
onMounted(async () => {
    pacientes.value = await listPacientes
});

// Variable para controlar la visibilidad del formulario de ingreso de paciente
const pacienteDatos = ref({});

// Funciones para manejar la visibilidad de los formularios
const agregarPaciente = () => {
    varView.showNuevoPaciente = true;
};

const modificarPaciente = (paciente) => {
    varView.showModificarPaciente = true;
    pacienteDatos.value = paciente;
};

</script>

<template>
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg p-6 py-7">
        <Tabla :columnas="[
            { titulo: 'name', tamaño: 200, ordenar: true },
            { titulo: 'No_document', tamaño: 100, ordenar: true },
            { titulo: 'municipio', tamaño: 50 },
            { titulo: 'genero', tamaño: 100 },
            { titulo: 'celular', tamaño: 100 },
            { titulo: 'Eps', tamaño: 150, ordenar: true }
        ]" :headerTabla="{ titulo: 'Gestion de Pacientes', descripcion: 'Administra y consulta información de pacientes', color: 'bg-[var(--color-default)] text-white', agregarRuta: agregarPaciente }"
            :acciones="{ action: true, icons: [{icon: 'actualizar', action: modificarPaciente}], botones: true }" :datos="{ content: pacientes }" />
    </div>
    <IngresarPaciente v-if="varView.showNuevoPaciente" />
    <ModificarPaciente v-if="varView.showModificarPaciente" :paciente="pacienteDatos" />
</template>