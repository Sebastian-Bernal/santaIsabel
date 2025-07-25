<script setup>
import Tabla from '../../components/Tables/Tabla.vue';
import IngresarPaciente from '../../components/Forms/Pacientes/IngresarPaciente.vue';
import ModificarPaciente from '../../components/Forms/Pacientes/ModificarPaciente.vue';

import { ref, onMounted, watch } from 'vue';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { useVarView } from '../../stores/varview.js';
import { storeToRefs } from 'pinia';

const varView = useVarView();
const pacientesStore = usePacientesStore();
const { listPacientes } = storeToRefs(pacientesStore);
const pacientes = ref([]);
const refresh = ref(1)

async function llamadatos(){
    pacientes.value= await listPacientes.value;
}

watch(() => varView.showNuevoPaciente, async()=>{
    await llamadatos()
    refresh.value++
})

watch(() => varView.showModificarPaciente, async()=>{
    await llamadatos()
    refresh.value++
})
// Cargar los pacientes desde el store
onMounted(async() => {
    varView.cargando = true
    await llamadatos()
    varView.cargando = false
});

// Variable para controlar la visibilidad del formulario de ingreso de paciente
const pacienteDatos = ref({});

// Funciones para manejar la visibilidad de los formularios
const agregarPaciente = () => {
    varView.showNuevoPaciente = true;
};

const verPaciente = (paciente) => {
    varView.showModificarPaciente = true;
    pacienteDatos.value = paciente;
};

</script>

<template>
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg py-8 px-12">
        <Tabla :key="refresh" :columnas="[
            { titulo: 'name', value: 'Nombre', tamaño: 150, ordenar: true },
            { titulo: 'No_document', value: 'Documento', tamaño: 100, ordenar: true },
            { titulo: 'municipio', value: 'Ciudad', tamaño: 150 },
            { titulo: 'genero', value: 'Genero', tamaño: 100 },
            { titulo: 'celular', value: 'Celular', tamaño: 100 },
            { titulo: 'Eps', value: 'EPS', tamaño: 150, ordenar: true }
        ]" :headerTabla="{ titulo: 'Gestion de Pacientes', descripcion: 'Administra y consulta información de pacientes', color: 'bg-[var(--color-default)] text-white', accionAgregar: agregarPaciente }"
            :acciones="{ icons: [{icon: 'ver', action: verPaciente}], botones: true }" :datos="{ content: pacientes }" />
    </div>
    <IngresarPaciente v-if="varView.showNuevoPaciente" />
    <ModificarPaciente v-if="varView.showModificarPaciente" :paciente="pacienteDatos" />
</template>