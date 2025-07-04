<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCalendarioCitas } from '../../stores/Calendario.js'
import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';0

import { diasSemana, mesesAño } from '../../data/Fechas.js'
import { storeToRefs } from 'pinia';

const citasStore = useCitasStore();
const calendarioCitasStore = useCalendarioCitas();
const Citas = ref([]);

// Importar states y funciones del store
const {
    fecha,
    dias,
    meses,
    años
} = storeToRefs(calendarioCitasStore);

onMounted(async () => {
    // Cargar citas desde el store
    Citas.value = await citasStore.listCitas;
});

const mesActual = ref(parseInt(meses.value) - 1)
const nombreMes = computed(() => mesesAño[mesActual.value].nombre + ' ' + años.value)

// Propiedad para acomodar Dia en el calendario
const diasDelMes = computed(() => {
    const mes = mesesAño[mesActual.value]; // { dias: 30, inicio: 6, etc. }
    const año = años.value;
    const mesNumero = String(mesActual.value + 1).padStart(2, '0');

    // Espacios vacíos antes del primer día del mes
    const espacios = Array(mes.inicio).fill({ dia: null, fecha: null });

    // Generar los días con su fecha completa
    const dias = Array.from({ length: mes.dias }, (_, i) => {
        const dia = String(i + 1).padStart(2, '0');
        return {
            dia: i + 1,
            fecha: `${dia}/${mesNumero}/${año}`
        };
    });

    return [...espacios, ...dias];
});

// Propiedad devuelve array de fechas de todas las citas
const diasConCitas = computed(() => {
    const arrayCitas = [];
    Citas.value.map((cita) => {
        arrayCitas.push(cita.fecha.split('-').reverse().join('/'))
    })
    return arrayCitas
})


// Navegar entre meses
const anteriorMes = () => {
    mesActual.value = (mesActual.value - 1 + 12) % 12
};

const siguienteMes = () => {
    mesActual.value = (mesActual.value + 1) % 12
};
</script>

<template>
    <div class="flex flex-col gap-5 border border-gray-300 rounded-2xl p-5 h-110 bg-white">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">{{ nombreMes }}</h2>
            <div class="flex items-center gap-3">
                <i class="fa-solid fa-angle-left text-blue-500" @click="anteriorMes"></i>
                <i class="fa-solid fa-angle-right text-blue-500" @click="siguienteMes"></i>
            </div>
        </div>
        <div class="grid grid-cols-7 gap-3 text-center">
            <h2 v-for="dia in diasSemana" class="text-semibold">{{ dia }}</h2>
        </div>

        <div class="grid grid-cols-7 gap-3">

            <div v-for="(num, index) in diasDelMes" @click="calendarioCitasStore.cambiarFecha(num.fecha)"
                class="px-5 py-3 flex justify-center items-center border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-200"
                :class="{ 'bg-red-200': num.fecha === fecha, 'text-gray-300': num.dia === dias.value }">
                <h2 :class="{ 'border-b-3 border-b-blue-500': diasConCitas.includes(num.fecha) }">{{ num.dia }}</h2>
            </div>
        </div>
    </div>
</template>