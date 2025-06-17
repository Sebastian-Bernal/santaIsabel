<script setup>
import StatsCards from './StatsCards';
import PacientesRecientes from './PacientesRecientes';
import Upcoming from './Upcoming';
import Acciones from './Acciones';

const stats = [
    {
        title: 'Pacientes Totales',
        value: '1,234',
        change: '+12%',
        changeType: 'positive',
        icon: 'Users',
        color: 'blue'
    },
    {
        title: 'Consultas Hoy',
        value: '28',
        change: '+8%',
        changeType: 'positive',
        icon: 'FileText',
        color: 'green'
    },
    {
        title: 'Citas Programadas',
        value: '45',
        change: '+15%',
        changeType: 'positive',
        icon: 'Calendar',
        color: 'purple'
    },
    {
        title: 'RIPS Pendientes',
        value: '7',
        change: '-5%',
        changeType: 'negative',
        icon: 'AlertCircle',
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
                <PacientesRecientes />
                <Upcoming />
            </div>
            <div>
                <Acciones />
            </div>
        </div>
    </div>

</template>