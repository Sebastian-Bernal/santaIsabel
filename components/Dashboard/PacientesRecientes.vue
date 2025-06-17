<script setup>

const recentPatients = [
    {
        id: '1',
        name: 'María González Pérez',
        document: 'CC 12345678',
        lastVisit: '2024-01-15',
        service: 'Medicina General',
        status: 'Completado'
    },
    {
        id: '2',
        name: 'Carlos Rodríguez López',
        document: 'CC 87654321',
        lastVisit: '2024-01-16',
        service: 'Odontología',
        status: 'En proceso'
    },
    {
        id: '3',
        name: 'Ana Sofía Martínez',
        document: 'CC 11223344',
        lastVisit: '2024-01-17',
        service: 'Psicología',
        status: 'Completado'
    }
];
</script>
<template>
    <div class="medical-card p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Pacientes Recientes</h2>
            <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Ver todos
            </button>
        </div>

        <div class="space-y-4">
            <div v-for="patient in recentPatients" :key="patient.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fa-solid fa-user h-5 w-5 text-blue-600"></i>
                    </div>
                    <div>
                        <h3 class="font-medium text-gray-900">{{ patient.name }}</h3>
                        <p class="text-sm text-gray-500">{{ patient.document }}</p>
                    </div>
                </div>

                <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">{{ patient.service }}</p>
                    <div class="flex items-center text-sm text-gray-500 mt-1">
                        <Clock class="h-3 w-3 mr-1" />
                        {{ patient.lastVisit }}
                    </div>
                </div>

                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-full" :class="patient.status === 'Completado' ? 'bg-green-600 text-white' : 'bg-amber-300'"  >
                        {{ patient.status }}
                    </span>
                    <button class="text-gray-400 hover:text-gray-600">
                        <FileText class="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>