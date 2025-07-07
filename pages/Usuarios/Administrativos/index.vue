<script setup>
import Tabla from '../../../components/Tables/Tabla.vue';
// Data

const administradores = [
    { name: 'Juan Perez', No_document: '123456789', edad: 30, profesion: 'Medico', telefono: '3001234567', municipio: 'Bogota' },
    { name: 'Maria Lopez', No_document: '987654321', edad: 28, profesion: 'Enfermera', telefono: '3007654321', municipio: 'Medellin' },
    { name: 'Carlos Gomez', No_document: '456789123', edad: 35, profesion: 'Administrador', telefono: '3004567891', municipio: 'Cali' }
];


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
    :headerTabla="{titulo: 'Gestion de Usuarios Administrativos', descripcion: 'Administra y consulta información de Usuarios Admin', color: 'bg-[var(--color-default)] text-white', agregarRuta: 'agregarMedico'}"
    :acciones="{ action: true, icons: [{icon: 'actualizar', action: 'modificarMedico'}], botones: true }" :datos="{content: administradores}"/>
    </div>
</template>