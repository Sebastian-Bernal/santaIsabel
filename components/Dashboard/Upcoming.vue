<script setup>
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
                Ver agenda
            </button>
        </div>

        <div class="space-y-3">
            <div v-for="appointment in appointments" :key="appointment.id"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div class="flex items-center space-x-3">
                    <div class="text-center">
                        <div class="text-lg font-bold text-blue-600">{{ appointment.time }}</div>
                        <div class="text-xs text-gray-500">Hoy</div>
                    </div>
                    <div>
                        <h3 class="font-medium text-gray-900">{{ appointment.patient }}</h3>
                        <p class="text-sm text-gray-500">{{ appointment.service }}</p>
                    </div>
                </div>

                <div class="text-right">
                    <span class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ appointment.type }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>