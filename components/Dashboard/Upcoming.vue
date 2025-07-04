<script setup>
import { useCalendarioCitas } from '~/stores/Calendario.js'
import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

const citasStore = useCitasStore();
const calendarioCitasStore = useCalendarioCitas();
const Citas = ref([]);

const {
    fechaActual,
} = storeToRefs(calendarioCitasStore);

onMounted(async () => {
    // Cargar citas desde el store
    Citas.value = await citasStore.listCitas;
});

// Citas filtradas segun dia seleccionado
const citasFiltradas = computed(() => {
    return Citas.value.filter(cita => cita.fecha.split('-').reverse().join('/') === fechaActual.value)
});


const appointments = [
    {
        id: '1',
        patient: 'Juan Carlos Mendoza',
        time: '09:00',
        service: 'Medicina General',
        type: 'Control'
    },
    {
        id: '2',
        patient: 'Lucia Fernández',
        time: '10:30',
        service: 'Odontología',
        type: 'Primera vez'
    },
    {
        id: '3',
        patient: 'Roberto Silva',
        time: '14:00',
        service: 'Psicología',
        type: 'Seguimiento'
    }
];

</script>

<template>
    <div class="medical-card p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Citas de Hoy</h2>
            <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                <nuxt-link to="/Usuarios/Citas">Ver agenda</nuxt-link>
            </button>
        </div>

        <div class="space-y-3">
            <div v-for="cita in citasFiltradas" :key="cita.id_paciente"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div class="flex items-center space-x-3">
                    <div class="text-center">
                        <div class="text-lg font-bold text-blue-600">{{ cita.hora }}</div>
                        <div class="text-xs text-gray-500">Hoy</div>
                    </div>
                    <div>
                        <h3 class="font-medium text-gray-900">{{ cita.name_paciente }}</h3>
                        <p class="text-sm text-gray-500">{{ cita.servicio }}</p>
                    </div>
                </div>

                <div class="text-right">
                    <span class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ cita.motivo }}
                    </span>
                </div>
            </div>
            <div v-if="citasFiltradas.length === 0" class="text-center text-gray-500">
                No hay citas programadas para hoy.
            </div>
        </div>
    </div>
</template>