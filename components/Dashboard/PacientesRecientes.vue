<script setup>
const props = defineProps(['ultimosPacientes']);
</script>

<template>
    <div class="medical-card p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Pacientes Recientes</h2>
            <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                <nuxt-link to="/Historial/Historias">Ver todos</nuxt-link>
            </button>
        </div>

        <div class="space-y-4">
            <div v-for="patient in props.ultimosPacientes" :key="patient.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fa-solid fa-user text-blue-600"></i>
                    </div>
                    <div>
                        <h3 class="font-medium text-gray-900">{{ patient.name_paciente }}</h3>
                        <p class="text-sm text-gray-500">{{ patient.No_document_paciente }}</p>
                    </div>
                </div>

                <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">{{ patient.tipoAnalisis }}</p>
                    <div class="flex items-center text-sm text-gray-500 mt-1">
                        <i class="h-3 w-3 mr-2 fa-solid fa-clock " ></i>
                        {{ patient.fecha_historia }}
                    </div>
                </div>

                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-full" :class="patient.status === 'Completado' ? 'bg-amber-300' : 'bg-green-600 text-white'"  >
                        Completado
                    </span>
                </div>
            </div>
        </div>
        <div v-if="props.ultimosPacientes < 1" class="flex justify-center py-5">
            <p class="text-gray-500 font-semibild">No se encontro ultimos Pacientes Atendidos</p>
        </div>
    </div>
</template>