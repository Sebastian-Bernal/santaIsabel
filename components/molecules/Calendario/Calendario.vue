<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCalendarioCitas } from '~/stores/Calendario.js'
import { diasSemana } from '~/data/Fechas.js'
import { storeToRefs } from 'pinia';

const props = defineProps({
  citas: {
    type: Array,
    default: () => []
  },
  Propiedades: {
    type: [Array, Object],
    default: () => []
  }
});

const calendarioCitasStore = useCalendarioCitas();
const Citas = ref(props.Propiedades.citas);
const notificacionesStore = useNotificacionesStore();

const {
    mensaje,
    options
} = notificacionesStore;

// Importar states y funciones del store
const {
    calendario,
    fecha,
    fechaActual,
    dias,
    meses,
    años,
    añoDesde
} = storeToRefs(calendarioCitasStore);

onMounted(() => {
    // Cargar citas desde el store
    calendarioCitasStore.obtenerFecha()
});

const mesActual = ref(parseInt(meses.value) - 1);
const nombreMes = computed(() => calendario.value[años.value - añoDesde.value].meses[mesActual.value].nombre + ' ' + años.value)

// Propiedad para acomodar Dia en el calendario
const diasDelMes = computed(() => {
    const añoIndex = años.value - añoDesde.value;
    const mes = calendario.value[añoIndex].meses[mesActual.value]; // { dias: 30, inicio: 6, etc. }
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

function parseFechaISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d); // siempre local, sin UTC
}

// Propiedad devuelve array de fechas de todas las citas
const diasConCitas = computed(() => {
    const arrayCitas = [];
    Citas.value.map((cita) => {
        if(cita.estado === 'Inactiva'){
            arrayCitas.push(cita.fecha.split('-').reverse().join('/'))
        }
    })
    return arrayCitas
})

const diasVencidos = computed(() => {
    const arrayCitas = [];
    Citas.value.map((cita) => {
        if (!cita.fechaHasta) {
            cita.fechaHasta = cita.fecha
        }

        const fechaHoyC = parseFechaISO(new Date().toISOString().split('T')[0]);
        const fechaHasta = parseFechaISO(cita.fechaHasta);
        if(cita.estado === 'Inactiva' && fechaHoyC > fechaHasta){
            arrayCitas.push(cita.fecha.split('-').reverse().join('/'))
        }
    })
    return arrayCitas
})


// Navegar entre meses
const anteriorMes = () => {
    if(mesActual.value === 0 && años.value === añoDesde.value) {
        options.position = 'top-end';
        options.texto = "Fecha mínima permitida";
        options.tiempo = 1500
        mensaje()
        return
    }
    if (mesActual.value === 0 && años.value > añoDesde.value) {
        mesActual.value = 11;
        meses.value = 12
        años.value--; // Resta el año si venimos de enero
    } else {
        meses.value--
        mesActual.value--;
    }
};

const siguienteMes = () => {
    if (mesActual.value === 11) {
        mesActual.value = 0;
        meses.value = 1
        años.value++; // Suma el año si avanzamos desde diciembre
    } else {
        mesActual.value++;
        meses.value ++
    }
};

</script>

<template>
    <div class="flex flex-col gap-5 border border-gray-300 rounded-2xl p-5 h-[62vh] overflow-y-auto scrollForm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">{{ nombreMes }}</h2>
            <div class="flex items-center">
                <div @click="anteriorMes" class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                    <i class="fa-solid fa-angle-left text-blue-500"></i>
                </div>
                <div @click="siguienteMes" class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                    <i class="fa-solid fa-angle-right text-blue-500"></i>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-7 gap-3 text-center">
            <h2 v-for="dia in diasSemana" class="text-semibold">{{ dia }}</h2>
        </div>

        <div class="grid grid-cols-7 gap-3">

            <div v-for="(num, index) in diasDelMes" @click="calendarioCitasStore.cambiarFecha(num.fecha)"
                class="px-5 py-3 flex justify-center items-center border border-gray-200 dark:border-gray-500 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500"
                :class="{ 'bg-red-200 dark:bg-red-400': num.fecha === fecha, 'border-2 !border-gray-400 !dark:border-gray-600': num.fecha === fechaActual }">
                <h2 :class="{ 
                    'border-b-3 border-b-blue-500 select-none': diasConCitas.includes(num.fecha),
                    'text-red-600 dark:text-red-300 select-none': diasVencidos?.includes(num.fecha)
                    }">
                    {{ num.dia }}
                </h2>
            </div>
        </div>
    </div>
</template>