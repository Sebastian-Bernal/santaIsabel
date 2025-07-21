<script setup>
import Tabla from '~/components/Tables/Tabla.vue';
// Data
import IngresarAdministrativo from '~/components/Forms/Administrativos/IngresarAdministrativo.vue';

const varView = useVarView();

const nuevoAdministrativo = () => {
    varView.showNuevoAdministrativo = true 
}

const administradores = []
</script>
<template>
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg py-8 px-12">
        <Tabla :columnas="[
        { titulo: 'name', tamaño: 200},
        { titulo: 'No_document', tamaño: 100},
        { titulo: 'tipo', tamaño: 100},
        { titulo: 'celular', tamaño: 100},
        { titulo: 'telefono', tamaño: 150}
    ]"
    :headerTabla="{titulo: 'Gestion de Usuarios Administrativos', descripcion: 'Administra y consulta información de Usuarios Admin', color: 'bg-[var(--color-default)] text-white', agregarRuta: nuevoAdministrativo}"
    :acciones="{ action: true, icons: [{icon: 'actualizar', action: 'modificarMedico'}], botones: true }" :datos="{content: administradores}"/>
    </div>
    <IngresarAdministrativo v-if="varView.showNuevoAdministrativo"></IngresarAdministrativo>
</template>