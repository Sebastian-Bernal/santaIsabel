<script setup>
import Tabla from '../../components/Tables/Tabla.vue';
import IngresarPaciente from '../../components/Forms/IngresarPaciente.vue';
// import { pacientes } from '../../data/pacientes';
import { ref, onMounted } from 'vue';
import { usePacientesStore } from '../../stores/Formularios/paciente/Paciente.js';

const pacientesStore = usePacientesStore();
const { listPacientes } = pacientesStore;
const pacientes = ref([]);

// Cargar los pacientes desde el store
onMounted(async () => {
    pacientes.value = await listPacientes
});

// Variable para controlar la visibilidad del formulario de ingreso de paciente
const nuevoPaciente = ref(false);
const agregarPaciente = () => {
    nuevoPaciente.value = true
};
</script>

<template>
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg p-6 py-7">
        <Tabla :columnas="[
            { titulo: 'name', tamaño: 200 },
            { titulo: 'No_document', tamaño: 100 },
            { titulo: 'municipio', tamaño: 50 },
            { titulo: 'genero', tamaño: 100 },
            { titulo: 'celular', tamaño: 100 },
            { titulo: 'Eps', tamaño: 150 }
        ]" :headerTabla="{ titulo: 'Gestion de Pacientes', descripcion: 'Administra y consulta información de pacientes', color: 'bg-[var(--color-default)] text-white', agregarRuta: agregarPaciente }"
            :acciones="{ action: true }" :datos="{ content: pacientes }" />
    </div>
    <IngresarPaciente v-if="nuevoPaciente" @close="nuevoPaciente = false" />
</template>