<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
// Data
import IngresarAdministrativo from '~/components/Forms/Administrativos/IngresarAdministrativo.vue';
import { useAdministrativosStore } from '~/stores/Formularios/administrativo/Administrativo';
import { storeToRefs } from 'pinia';

const varView = useVarView();
const administrativosStore = useAdministrativosStore();
const { listAdministrativos } =storeToRefs(administrativosStore);
const administrativos = ref([]);
const refresh = ref(1)

async function llamadatos(){
    administrativos.value= await listAdministrativos.value;
}

watch(() => varView.showNuevoAdministrativo, async()=>{
    await llamadatos()
    refresh.value++
})

// Cargar los pacientes desde el store
onMounted(async() => {
    varView.cargando = true
    await llamadatos()
    varView.cargando = false
});

const nuevoAdministrativo = () => {
    varView.showNuevoAdministrativo = true 
}
</script>
<template>
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg py-8 px-12">
        <Tabla :key="refresh" :columnas="[
        { titulo: 'name', tamaño: 200},
        { titulo: 'No_document', tamaño: 100},
        { titulo: 'Tipo', tamaño: 100},
        { titulo: 'celular', tamaño: 100},
        { titulo: 'telefono', tamaño: 150}
    ]"
    :headerTabla="{titulo: 'Gestion de Usuarios Administrativos', descripcion: 'Administra y consulta información de Usuarios Admin', color: 'bg-[var(--color-default)] text-white', agregarRuta: nuevoAdministrativo}"
    :acciones="{ action: true, icons: [{icon: 'actualizar', action: 'modificarMedico'}], botones: true }" :datos="{content: administrativos}"/>
    </div>
    <IngresarAdministrativo v-if="varView.showNuevoAdministrativo"></IngresarAdministrativo>
</template>