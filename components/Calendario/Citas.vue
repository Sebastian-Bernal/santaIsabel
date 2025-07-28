<script setup>
import { useCalendarioCitas } from '../../stores/Calendario.js'
import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';
import { computed, onMounted, ref } from 'vue';
import { mesesAño } from '../../data/Fechas.js'
import { storeToRefs } from 'pinia';

const citasStore = useCitasStore();
const calendarioCitasStore = useCalendarioCitas();
const Citas = ref([]);

const {
    fechaActual,
    fecha,
    dias,
    meses
} = storeToRefs(calendarioCitasStore);

onMounted(async () => {
    // Cargar citas desde el store
    Citas.value = await citasStore.listCitas;
});

// Citas filtradas segun dia seleccionado
const citasFiltradas = computed(() => {
    return Citas.value.filter(cita => cita.fecha.split('-').reverse().join('/') === fecha.value)
});

// Nombre del mes
const mes = computed(() => {
    return mesesAño[parseInt(meses.value) - 1].nombre
});

// Fecha de la cita Hoy
const fechaCita = computed(() => {
    if(fechaActual.value === fecha.value){
        return 'Hoy'
    } else {
        return `${fecha.value.split('-')[0]}`
    }
});

</script>

<template>
    <div class="py-5 flex flex-col gap-1 border border-gray-300 rounded-2xl h-110 overflow-y-auto bg-white">
        <h2 class="text-xl font-semibold my-2 px-10">{{ calendarioCitasStore.diaSemana }}, {{ dias }} {{ mes }}</h2>
        <div class="py-4 lg:px-10 md:px-5 px-2 flex justify-between items-center pb-2 rounded-2xl border border-gray-200 hover:bg-white"
            v-for="cita in citasFiltradas">
            <div class="flex gap-5 items-center md:flex-col lg:flex-row sm:flex-row">
                <div class="flex flex-col items-center">
                    <h2 class="text-blue-500 text-lg font-bold">{{ cita.hora }}</h2>
                    <p class="text-xs text-gray-500">{{ fechaCita }}</p>
                </div>
                <div>
                    <p class="font-semibold">{{ cita.name_paciente }}</p>
                    <p class="text-sm text-gray-700">{{ cita.servicio }}</p>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <h3 class="text-sm flex gap-2 items-center"> <i class="fa-solid fa-user-doctor text-gray-500"></i>
                    {{ cita.name_medico }}</h3>
                <h3 class="text-sm"><i class="fa-solid fa-stethoscope text-blue-500"></i> {{ cita.motivo }}</h3>
            </div>
        </div>

        <div v-if="citasFiltradas.length < 1" class="w-full py-8 flex justify-center">
            <h2 class="text-lg text-gray-500">No hay citas programadas.</h2>
        </div>
    </div>
</template>