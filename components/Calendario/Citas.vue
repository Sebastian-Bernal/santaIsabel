<script setup>
import Button from '../Buttons/Button.vue';
import IngresarPaciente from '~/components/Forms/Pacientes/IngresarPaciente.vue'
import Ingresar from '~/components/Forms/Historia/Ingresar.vue';
import Paso2 from '~/components/Forms/Historia/Paso2.vue';
import Paso3 from '~/components/Forms/Historia/Paso3.vue';
import Paso4 from '~/components/Forms/Historia/Paso4.vue';
import { useCalendarioCitas } from '../../stores/Calendario.js'
import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';
import { computed, onMounted, ref } from 'vue';
import { nombresMeses } from '../../data/Fechas.js'
import { validarYEnviarCancelarCita } from '~/Core/Cita/CancelarCita';
import { storeToRefs } from 'pinia';

const varView = useVarView();
const citasStore = useCitasStore();
const calendarioCitasStore = useCalendarioCitas();
const Citas = ref([]);
const paciente = ref({})
const notificacionesStore = useNotificacionesStore()

const {
    fechaActual,
    fecha,
    dias,
    meses,
} = storeToRefs(calendarioCitasStore);

const {
    alertRespuestaInput,
    simple,
    mensaje,
    options
} = notificacionesStore;

const mesActual = ref(parseInt(meses.value) - 1)

onMounted(async () => {
    // Cargar citas desde el store
    Citas.value = await citasStore.listCitas;
});

// Citas filtradas segun dia seleccionado
const citasFiltradas = computed(() => {
    return Citas.value.filter(cita => cita.fecha.split('-').reverse().join('/') === fecha.value)
});

// Nombre del mes
const mes = computed(() => {
    return nombresMeses[meses.value - 1]
});

// Fecha de la cita Hoy
const fechaCita = computed(() => {
    if (fechaActual.value === fecha.value) {
        return 'Hoy'
    } else {
        return `${fecha.value.split('-')[0]}`
    }
});

async function cancelarCita(cita) {
    options.icono = 'warning';
    options.titulo = 'Deseas Cancelar la cita?';
    options.html = `Se cancelara la cita de: <span>${cita.name_paciente}</span>`;
    options.input = 'text';
    options.inputAtributes = { placeholder: "Motivo de cancelacion", }
    options.confirmtext = 'Si, Cancelar'
    options.canceltext = 'Atras'
    const respuestaAlert = await alertRespuestaInput()
    if (respuestaAlert.estado === 'confirmado') {
        if (respuestaAlert.valor === '') {
            options.position = 'top-end';
            options.texto = "Ingrese un motivo de cancelacion.";
            options.background = '#d33'
            options.tiempo = 1500
            mensaje()
            return
        }
        const res = validarYEnviarCancelarCita(cita, respuestaAlert.valor)
        if (res) {
            options.position = 'top-end';
            options.texto = "Cita Cancelada con exito.";
            options.background = '#6bc517'
            options.tiempo = 1500
            mensaje()
            options.background = '#d33'
        }
    }
}

function showMotivo(cita) {
    options.icono = "info";
    options.titulo = "Motivo de cancelacion";
    options.texto = `${cita.motivoCancelacion}`;
    options.tiempo = 5000;
    simple();
}

async function activarCita(cita){
    console.log(cita)
    paciente.value = cita.id_paciente
    varView.showNuevaHistoria = true
}

</script>

<template>
    <div class="py-5 flex flex-col gap-3 border border-gray-300 rounded-2xl h-110 overflow-y-auto bg-white scrollForm">
        <h2 class="text-xl font-semibold my-2 px-10">{{ calendarioCitasStore.diaSemana }}, {{ dias }} {{ mes }}</h2>
        <div class="py-4 mx-5 lg:px-10 md:px-5 px-2 flex justify-between items-center pb-2 rounded-2xl border border-gray-200 shadow-lg"
            v-for="cita in citasFiltradas" :class="{ 'bg-red-50': cita.estado === 'cancelada' }">
            <div class="flex gap-5 items-center md:flex-col lg:flex-row sm:flex-row">
                <div class="flex flex-col items-center">
                    <h2 class="text-blue-500 text-lg font-bold">{{ cita.hora }}</h2>
                    <p class="text-xs text-gray-500">{{ fechaCita }}</p>
                </div>
                <div>
                    <p class="font-semibold">{{ cita.name_paciente }}</p>
                    <p class="text-sm text-gray-700">{{ cita.servicio }}</p>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <h3 class="text-sm flex gap-2 items-center"> <i class="fa-solid fa-user-doctor text-gray-500"></i>
                    {{ cita.name_medico }}</h3>
                <h3 class="text-sm"><i class="fa-solid fa-stethoscope text-blue-500"></i> {{ cita.motivo }}</h3>
            </div>
            <div class="flex flex-col gap-2" v-if="cita.estado === 'Inactiva'">
                <Button color="bg-blue-600 w-[25px]! h-[25px]!" @click="activarCita(cita)"><i class="fa-solid fa-check"></i></Button>
                <Button color="bg-red-300 w-[25px]! h-[25px]!" @click="cancelarCita(cita)"><i
                        class="fa-solid fa-xmark"></i></Button>
            </div>
            <div class="flex flex-col gap-2" v-if="cita.estado === 'cancelada'">
                <Button color="bg-gray-400 w-[25px]! h-[25px]!" @click="showMotivo(cita)"><i
                        class="fa-solid fa-info"></i></Button>
            </div>
        </div>

        <div v-if="citasFiltradas.length < 1" class="w-full py-8 flex justify-center">
            <h2 class="text-lg text-gray-500">No hay citas programadas.</h2>
        </div>
    </div>
    <IngresarPaciente v-if="varView.showNuevoPaciente" />
    <Ingresar v-if="varView.showNuevaHistoria" :paciente="paciente" />
    <Paso2 v-if="varView.showPaso2" />
    <Paso3 v-if="varView.showPaso3" />
    <Paso4 v-if="varView.showPaso4" />
</template>