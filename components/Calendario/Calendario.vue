<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCalendarioCitas } from '../../stores/Calendario.js'
import { citas } from '../../data/Citas.js'
import { storeToRefs } from 'pinia';

const calendarioCitasStore = useCalendarioCitas();

const {
    fecha,
    dias,
    meses,
    años
} = storeToRefs(calendarioCitasStore);

const diasSemana = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const mesesAño = [
    { nombre: 'Enero', dias: 31, inicio: 3 },
    { nombre: 'Febrero', dias: 28, inicio: 6 },
    { nombre: 'Marzo', dias: 31, inicio: 6 },
    { nombre: 'Abril', dias: 30, inicio: 2 },
    { nombre: 'Mayo', dias: 31, inicio: 4 },
    { nombre: 'Junio', dias: 30, inicio: 0 },
    { nombre: 'Julio', dias: 31, inicio: 2 },
    { nombre: 'Agosto', dias: 31, inicio: 5 },
    { nombre: 'Septiembre', dias: 30, inicio: 1 },
    { nombre: 'Octubre', dias: 31, inicio: 3 },
    { nombre: 'Noviembre', dias: 30, inicio: 6 },
    { nombre: 'Diciembre', dias: 31, inicio: 1 },
];

const mesActual = ref(parseInt(meses.value) - 1)

const nombreMes = computed(() => mesesAño[mesActual.value].nombre + ' ' + años.value)


const diasDelMes = computed(() => {
    const mes = mesesAño[mesActual.value]; // { dias: 30, inicio: 6, etc. }
    const año = new Date().getFullYear(); // O si usas una store para el año, mejor desde ahí
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

const diasConCitas = computed(() => {
    const arrayCitas = [];
    citas.map((cita) => {
        arrayCitas.push(cita.fecha)
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