<script setup>
import {ref, coputed, onMounted} from 'vue';
import {useCalendarioCitas} from '../../stores/Calendario.js'

const dias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const meses = [
    { nombre: 'Enero', dias: 31, inicio: 1 },
    { nombre: 'Febrero', dias: 28, inicio: 4 },
    { nombre: 'Marzo', dias: 31, inicio: 4 },
    { nombre: 'Abril', dias: 30, inicio: 0 },
    { nombre: 'Mayo', dias: 31, inicio: 2 },
    { nombre: 'Junio', dias: 30, inicio: 0 },
    { nombre: 'Julio', dias: 31, inicio: 0 },
    { nombre: 'Agosto', dias: 31, inicio: 3 },
    { nombre: 'Septiembre', dias: 30, inicio: 6 },
    { nombre: 'Octubre', dias: 31, inicio: 1 },
    { nombre: 'Noviembre', dias: 30, inicio: 4 },
    { nombre: 'Diciembre', dias: 31, inicio: 6 },
];

const mesActual = ref(5) // Junio = índice 5

const nombreMes = computed(() => meses[mesActual.value].nombre + ' 2025')

// Genera los días con espacios vacíos al inicio según el día de comienzo
const diasDelMes = computed(() => {
    const mes = meses[mesActual.value]
    const espacios = Array(mes.inicio).fill(null)
    const dias = Array.from({ length: mes.dias }, (_, i) => i + 1)
    return [...espacios, ...dias]
});

// Navegar entre meses
const anteriorMes = () => {
    mesActual.value = (mesActual.value - 1 + 12) % 12
};

const siguienteMes = () => {
    mesActual.value = (mesActual.value + 1) % 12
};

</script>

<template>
    <div class="flex flex-col gap-5 border border-gray-300 rounded-2xl p-5 h-fit bg-white">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">{{ nombreMes }}</h2>
            <div class="flex items-center gap-3">
                <i class="fa-solid fa-angle-left text-blue-500" @click="anteriorMes"></i>
                <i class="fa-solid fa-angle-right text-blue-500" @click="siguienteMes"></i>
            </div>
        </div>
        <div class="grid grid-cols-7 gap-3 text-center">
            <h2 v-for="dia in dias" class="text-semibold">{{ dia }}</h2>
        </div>

        <div class="grid grid-cols-7 gap-3">

            <div v-for="(num, index) in diasDelMes" class="px-5 py-3 flex justify-center items-center border border-gray-200 rounded-xl"
                :class="{ 'bg-red-200': num === 24 }">
                <h2 :class="{ 'border-b border-b-blue-500': num === 25 || num === 26 }">{{ num }}</h2>
            </div>
        </div>
    </div>
</template>