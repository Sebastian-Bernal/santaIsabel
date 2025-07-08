<script setup>
import Tabla from '~/components/Tables/Tabla.vue';

const Evoluciones = [];

</script>

<template>
    <div class="w-[100%] min-h-[100%] bg-gray-50 rounded-lg py-8 px-12">
        <div v-if="Evoluciones.length === 0" class="flex justify-center items-center p-5">
            <p>No hay registros de Evoluciones para este paciente</p>
        </div>
        <Tabla v-if="Evoluciones.length !== 0" :columnas="[
            { titulo: 'Fecha', tamaño: 100, ordenar: true },
            { titulo: 'Motivo', tamaño: 100, ordenar: true },
            { titulo: 'Diagnosticos', tamaño: 200 },
        ]" :headerTabla="{ titulo: 'Evoluciones', color: 'bg-[var(--color-default)] text-white', agregarRuta: agregarHistoria }"
            :acciones="{ action: true, icons: [{ icon: 'ver', action: verHistoria }], botones: true }"
            :datos="{ content: Evoluciones }" />
    </div>
</template>