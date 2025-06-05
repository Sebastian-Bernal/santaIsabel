<script setup>
import {ref} from 'vue';
import Tabla from '../../components/Tables/Tabla.vue';
const pacientes = ref([
    { nombre: 'Juan', apellido: 'Perez', edad: 30, genero: 'Masculino', telefono: '1234567890', eps: 'Coomeva' },
    { nombre: 'Ana', apellido: 'Lopez', edad: 28, genero: 'Femenino', telefono: '9876543210', eps: 'Sura' },
    { nombre: 'Carlos', apellido: 'Martinez', edad: 35, genero: 'Masculino', telefono: '1231231234', eps: 'Compensar' },
    { nombre: 'Laura', apellido: 'Hernandez', edad: 22, genero: 'Femenino', telefono: '4564564567', eps: 'Sanitas' },
    { nombre: 'Pedro', apellido: 'Ramirez', edad: 40, genero: 'Masculino', telefono: '7897897890', eps: 'Nueva EPS' },
    { nombre: 'Sofia', apellido: 'Torres', edad: 32, genero: 'Femenino', telefono: '3213213210', eps: 'Medimás' },
    { nombre: 'Luis', apellido: 'Gonzalez', edad: 29, genero: 'Masculino', telefono: '6546546543', eps: ''},
    { nombre: 'Isabel', apellido: 'Fernandez', edad: 27, genero: 'Femenino', telefono: '1112223333', eps: 'Famisanar' },
    { nombre: 'Andres', apellido: 'Castro', edad: 31, genero: 'Masculino', telefono: '4445556666', eps: 'Coosalud' },
    { nombre: 'Maria', apellido: 'Gomez', edad: 25, genero: 'Femenino', telefono: '0987654321', eps: 'Nueva EPS'}
]);
definePageMeta({
    layout: 'authentication'
});
</script>
<template>
    <div class="w-[90%] h-4/5 bg-white rounded-lg shadow-lg p-6 py-7 relative">
        <Tabla :columnas="[
        { titulo: 'nombre', tamaño: 100},
        { titulo: 'apellido', tamaño: 100},
        { titulo: 'edad', tamaño: 50},
        { titulo: 'genero', tamaño: 50},
        { titulo: 'telefono', tamaño: 100},
        { titulo: 'eps', tamaño: 150}
    ]"
    :headerTabla="{titulo: 'Pacientes', color: 'bg-[var(--color-primary)] text-white'}"
    :acciones="{ action: true}"
    :datos="{content: pacientes}"/>
    </div>
    
</template>