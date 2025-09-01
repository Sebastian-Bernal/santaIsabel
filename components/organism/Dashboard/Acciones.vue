<script setup>
import { useVarView } from "~/stores/varview.js";

const varView = useVarView();
const actions = [
    {
        title: 'Nuevo Paciente',
        description: 'Registrar un nuevo paciente',
        icon: 'fa-plus',
        color: 'bg-[var(--color-default-200)] hover:opacity-75',
        action: () => varView.showNuevoPaciente = true,
    },
    {
        title: 'Buscar Historia',
        description: 'Buscar historia clínica',
        icon: 'fa-search',
        color: 'bg-[var(--color-default-400)] hover:opacity-75',
        url: '/Historial/Historias',
        action: () => console.log('Buscar historia')
    },
    {
        title: 'Nueva Historia',
        description: 'Crear historia clínica',
        icon: 'fa-file',
        color: 'bg-[var(--color-default-600)] hover:opacity-75',
        action: () => varView.showNuevaHistoria = true
    },
    {
        title: 'Exportar RIPS',
        description: 'Generar reporte RIPS',
        icon: 'fa-download',
        color: 'bg-[var(--color-default-700)] hover:opacity-75',
        url: '/Facturacion/rips',
        action: () => console.log('Exportar RIPS')
    }
];

</script>

<template>
    <div class="space-y-6">
        <div class="medical-card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h2>
            <div class="space-y-3">


                <button v-for="action in actions" @click="action.action" :key="action.title"
                    class="w-full p-4 rounded-lg text-white transition-colors duration-200" :class="action.color">
                    <a :href="action.url">
                        <div class="flex items-center space-x-3">
                            <i class="fa-solid" :class="action.icon"></i>
                            <div class="text-left">
                                <div class="font-medium">{{ action.title }}</div>
                                <div class="text-sm opacity-90">{{ action.description }}</div>
                            </div>
                        </div>
                    </a>
                </button>

            </div>
        </div>

        <div class="medical-card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen de Hoy</h2>
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <i class="fa-solid fa-user h-4 w-4 text-blue-500"></i>
                        <span class="text-sm text-gray-600 dark:text-gray-300">Pacientes atendidos</span>
                    </div>
                    <span class="font-semibold text-gray-900 dark:text-white">24</span>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <i class="fa-solid fa-file h-4 w-4 text-[#4aa759]"></i>
                        <span class="text-sm text-gray-600 dark:text-gray-300">Historias creadas</span>
                    </div>
                    <span class="font-semibold text-gray-900 dark:text-white">18</span>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <i class="fa-solid fa-clock h-4 w-4 text-[#a74a98]"></i>
                        <span class="text-sm text-gray-600 dark:text-gray-300">Tiempo promedio</span>
                    </div>
                    <span class="font-semibold text-gray-900 dark:text-white">25 min</span>
                </div>
            </div>
        </div>
    </div>
</template>