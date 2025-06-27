<script setup>
import Tabla from '../../../components/Tables/Tabla.vue';
import { medicos } from '../../../data/medicos';
</script>
<template>
    <div class="w-[100%] h-[100%] bg-gray-50 rounded-lg shadow-lg p-6 py-7">
        <Tabla :columnas="[
        { titulo: 'nombre', tamaño: 200},
        { titulo: 'documento', tamaño: 100},
        { titulo: 'edad', tamaño: 50},
        { titulo: 'profesion', tamaño: 100},
        { titulo: 'telefono', tamaño: 100},
        { titulo: 'municipio', tamaño: 150}
    ]"
    :headerTabla="{titulo: 'Gestion de Medicos', descripcion: 'Administra y consulta información de Medicos', color: 'bg-[var(--color-default)] text-white', agregarRuta: '/Pacientes/Profesional'}"
    :acciones="{ action: true}"
    :datos="{content: medicos}"/>
    </div>
</template>