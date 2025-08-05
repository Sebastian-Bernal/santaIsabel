<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
// Data
import IngresarUser from '~/components/Forms/Users/IngresarUser.vue';
import ModificarUser from '~/components/Forms/Users/ModificarUser.vue';
import { useUsersStore } from '~/stores/Formularios/usuarios/Users';
import { storeToRefs } from 'pinia';

const varView = useVarView();
const UsersStore = useUsersStore();
const { listUsers } =storeToRefs(UsersStore);
const Users = ref([]);
const datosUser = ref()
const refresh = ref(1)

async function llamadatos(){
    Users.value= await listUsers.value;
}

watch(() => varView.showNuevoUser, async()=>{
    await llamadatos()
    refresh.value++
})

// Cargar los pacientes desde el store
onMounted(async() => {
    varView.cargando = true
    await llamadatos()
    varView.cargando = false
});

const nuevoUser = () => {
    varView.showNuevoUser = true 
}

const modificarUser = (user) => {
    varView.showModificarUser = true
    datosUser.value = user;
}
</script>
<template>
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg md:py-8 py-4 md:px-12 px-4">
        <Tabla :key="refresh" :columnas="[
        { titulo: 'name', value: 'Nombre', tamaño: 200},
        { titulo: 'No_document', value: 'Documento', tamaño: 100},
        { titulo: 'rol', value: 'Rol', tamaño: 100},
        { titulo: 'celular', value: 'Celular', tamaño: 100},
        { titulo: 'estado', value: 'Estado', tamaño: 150}
    ]"
    :headerTabla="{titulo: 'Gestion de Usuarios', descripcion: 'Administra y consulta información de Usuarios Admin', color: 'bg-[var(--color-default)] text-white', accionAgregar: nuevoUser}"
    :acciones="{ icons: [{icon: 'ver', action: modificarUser}], botones: true }" :datos="{content: Users}"/>
    </div>
    <IngresarUser v-if="varView.showNuevoUser"></IngresarUser>
    <ModificarUser v-if="varView.showModificarUser" :User="datosUser"></ModificarUser>
</template>