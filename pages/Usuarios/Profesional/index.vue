<script setup>
import Tabla from '../../../components/Tables/Tabla.vue';
import IngresarProfesional from '~/components/Forms/Profesionales/IngresarProfesional.vue';
import ModificarProfesional from '~/components/Forms/Profesionales/ModificarProfesional.vue';
// Data
import { ref, onMounted } from 'vue';
import { useMedicosStore } from '../../../stores/Formularios/medicos/Medico.js';
import {useVarView} from '../../stores/varview.js';

const varView = useVarView();
const medicosStore = useMedicosStore();
const { listMedicos } = medicosStore;
const medicos = ref([]);

// Cargar los Medicos desde el store
onMounted(async () => {
    medicos.value = await listMedicos
});

// Variable para controlar la visibilidad del formulario de ingreso de profesional
const medicoDatos = ref(false);

const agregarMedico = () => {
    varView.showNuevoProfesional = true;
};

const modificarMedico = (medico) => {
    varView.showModificarProfesional = true;
    medicoDatos.value = medico;
};
</script>
<template>
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg py-8 px-12">
        <Tabla :columnas="[
        { titulo: 'name', tamaño: 200},
        { titulo: 'No_document', tamaño: 100},
        { titulo: 'edad', tamaño: 50},
        { titulo: 'profesion', tamaño: 100},
        { titulo: 'telefono', tamaño: 100},
        { titulo: 'municipio', tamaño: 150}
    ]"
    :headerTabla="{titulo: 'Gestion de Profesionales de Medicina', descripcion: 'Administra y consulta información de Medicos', color: 'bg-[var(--color-default)] text-white', agregarRuta: agregarMedico}"
    :acciones="{ action: true, icons: [{icon: 'actualizar', action: modificarMedico}], botones: true }" :datos="{content: medicos}"/>
    </div>
    <IngresarProfesional v-if="varView.showNuevoProfesional" />
    <ModificarProfesional v-if="varView.showModificarProfesional" :medico="medicoDatos" />
</template>