<script setup>
import Tabla from '../../components/Tables/Tabla.vue';
import { pacientes } from '../../data/pacientes';
import Fondo from '~/components/Fondo.vue';

// definePageMeta({
//     layout: 'authentication'
// });
</script>
<template>
    <Fondo>
    <div class="w-[90%] h-4/5 bg-white rounded-lg shadow-lg p-6 py-7 relative">
        <Tabla :columnas="[
        { titulo: 'nombre', tamaño: 200},
        { titulo: 'documento', tamaño: 100},
        { titulo: 'edad', tamaño: 50},
        { titulo: 'genero', tamaño: 100},
        { titulo: 'telefono', tamaño: 100},
        { titulo: 'eps', tamaño: 150}
    ]"
    :headerTabla="{titulo: 'Pacientes', color: 'bg-[var(--color-primary)] text-white'}"
    :acciones="{ action: true}"
    :datos="{content: pacientes}"/>
    </div>
    </Fondo>
</template>