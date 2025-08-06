<script setup>
import Tabla from '../../../components/Tables/Tabla.vue';
import IngresarProfesional from '~/components/Forms/Profesionales/IngresarProfesional.vue';
import IngresarUsuario from '~/components/Forms/Profesionales/IngresarUsuario.vue';
import ModificarProfesional from '~/components/Forms/Profesionales/ModificarProfesional.vue';
// Data
import { ref, onMounted } from 'vue';
import { useMedicosStore } from '../../../stores/Formularios/medicos/Medico.js';
import {useVarView} from '../../stores/varview.js';
import { storeToRefs } from 'pinia';

const varView = useVarView();
const medicosStore = useMedicosStore();
const { listMedicos } = storeToRefs(medicosStore);
const medicos = ref([]);
const refresh = ref(1);

async function llamadatos () {
    medicos.value= await listMedicos.value;
}

watch(()=> varView.showNuevoProfesionalPaso2, async()=>{
    llamadatos()
    refresh.value++
})

watch(()=> varView.showModificarProfesional, async()=>{
    llamadatos()
    refresh.value++
})

// Cargar los Medicos desde el store
onMounted(async () => {
    varView.cargando = true
    await llamadatos()
    varView.cargando = false
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
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg md:py-8 py-4 md:px-12 px-4">
        <Tabla :key="refresh" :columnas="[
        { titulo: 'name', value: 'Nombre', tamaño: 200},
        { titulo: 'No_document', value: 'Documento', ordenar: true, tamaño: 100},
        { titulo: 'profesion', value: 'Profesión', tamaño: 100},
        { titulo: 'celular', value: 'Celular', tamaño: 100},
        { titulo: 'zona', value: 'Zona', tamaño: 50},
        { titulo: 'municipio', value: 'Municipio', tamaño: 150}
    ]"
    :headerTabla="{titulo: 'Gestion de Profesionales de Medicina', descripcion: 'Administra y consulta información de Medicos', color: 'bg-[var(--color-default)] text-white', accionAgregar: agregarMedico}"
    :acciones="{ icons: [{icon: 'ver', action: modificarMedico}], botones: true }" :datos="{content: medicos}"/>
    </div>
    <IngresarUsuario v-if="varView.showNuevoProfesional" />
    <IngresarProfesional v-if="varView.showNuevoProfesionalPaso2" />
    <ModificarProfesional v-if="varView.showModificarProfesional" :medico="medicoDatos" />
</template>