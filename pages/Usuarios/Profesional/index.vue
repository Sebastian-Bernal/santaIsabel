<script setup>
import Tabla from '../../../components/Tables/Tabla.vue';
import IngresarMedico from '../../../components/Forms/IngresarMedico.vue';
// Data
// import { medicos } from '../../../data/medicos';
import { ref, onMounted } from 'vue';
import { useMedicosStore } from '../../../stores/Formularios/medicos/Medico.js';

const medicosStore = useMedicosStore();
const { listMedicos } = medicosStore;
const medicos = ref([]);

// Cargar los Medicos desde el store
onMounted(async () => {
    medicos.value = await listMedicos
});

// Variable para controlar la visibilidad del formulario de ingreso de profesional
const nuevoMedico = ref(false);
const agregarMedico = () => {
    nuevoMedico.value = true
};
</script>
<template>
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg p-6 py-7">
        <Tabla :columnas="[
        { titulo: 'name', tamaño: 200},
        { titulo: 'No_document', tamaño: 100},
        { titulo: 'edad', tamaño: 50},
        { titulo: 'profesion', tamaño: 100},
        { titulo: 'telefono', tamaño: 100},
        { titulo: 'municipio', tamaño: 150}
    ]"
    :headerTabla="{titulo: 'Gestion de Medicos', descripcion: 'Administra y consulta información de Medicos', color: 'bg-[var(--color-default)] text-white', agregarRuta: agregarMedico}"
    :acciones="{ action: true}"
    :datos="{content: medicos}"/>
    </div>
    <IngresarMedico v-if="nuevoMedico" @close="nuevoMedico = false" />
</template>