<script setup>
import StatsCards from './StatsCards';
import PacientesRecientes from './PacientesRecientes';
import Upcoming from './Upcoming';
import Acciones from './Acciones';
import { onMounted, ref } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';

const citasStore = useCitasStore();
const historiaStore = useHistoriasStore();
const varView = useVarView()

const Citas = ref([]);
const ultimosPacientes = ref();

onMounted(async () => {
    varView.cargando = true
    // Cargar citas y pacientes desde el store
    Citas.value = await citasStore.listCitas;
    ultimosPacientes.value = await historiaStore.ultimasHistorias()
    varView.cargando = false
});

const stats = [
    {
        title: 'Pacientes Totales',
        value: '1,234',
        change: '+12%',
        changeType: 'positive',
        icon: 'fa-users',
        color: 'blue'
    },
    {
        title: 'Consultas Hoy',
        value: '28',
        change: '+8%',
        changeType: 'positive',
        icon: 'fa-file',
        color: 'green'
    },
    {
        title: 'Citas Programadas',
        value: '45',
        change: '+15%',
        changeType: 'positive',
        icon: 'fa-calendar',
        color: 'purple'
    },
    {
        title: 'RIPS Pendientes',
        value: '7',
        change: '-5%',
        changeType: 'negative',
        icon: 'fa-file-export',
        color: 'orange'
    }
];
</script>

<template>
    <div class="space-y-6 fade-in">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-gray-600 mt-1">
                Resumen de actividad del sistema de historias clínicas
            </p>
        </div>


        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCards v-for="stat in stats" key={index} :data="stat" />
        </div>


        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
                <PacientesRecientes :ultimosPacientes="ultimosPacientes"/>
                <Upcoming :Citas="Citas"/>
            </div>
            <div>
                <Acciones />
            </div>
        </div>
    </div>

</template>