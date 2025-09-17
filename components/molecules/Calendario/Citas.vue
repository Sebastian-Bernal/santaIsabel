<script setup>
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';

import { useCalendarioCitas } from '~/stores/Calendario.js'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { computed, ref } from 'vue';
import { nombresMeses } from '~/data/Fechas.js'
import { validarYEnviarCancelarCita } from '~/Core/Usuarios/Cita/CancelarCita';
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
const historiasStore = useHistoriasStore();
const Citas = ref(props.Propiedades.citas);
const paciente = ref({});
const citaSeleccionada = ref({});
const notificacionesStore = useNotificacionesStore();
const showNuevaHistoria = ref(false)

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

// Citas filtradas segun dia seleccionado
const citasFiltradas = computed(() => {
    return Citas.value?.filter(cita => {
        const fechaFormateada = cita.fecha?.split('-')?.reverse()?.join('/');
        return fechaFormateada === fecha.value;
    });
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

async function showObservacion(cita) {
    const historia = await historiasStore.listDatos(cita.id_analisis, 'Analisis', 'id')
    const observacion = historia[0].observacion
    options.icono = "info";
    options.titulo = "Observacion del Profesional";
    options.texto = `${observacion}`;
    options.tiempo = 5000;
    simple();
}

async function activarCita(cita) {
    paciente.value = cita.id_paciente
    citaSeleccionada.value = cita
    showNuevaHistoria.value = true
}

</script>

<template>
    <div class="py-5 flex flex-col gap-3 border border-gray-300 dark:border-gray-600 rounded-2xl h-110 overflow-y-auto bg-white dark:bg-gray-700 scrollForm">
        <h2 class="text-xl font-semibold my-2 px-10">{{ calendarioCitasStore.diaSemana }}, {{ dias }} {{ mes }}</h2>
        <!-- Card Citas -->
        <div class="py-4 mx-5 lg:px-10 md:px-5 px-2 flex justify-between items-center pb-2 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-lg dark:shadow-gray-800"
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
                <ButtonRounded color="bg-blue-600 w-[25px]! h-[25px]!" @click="activarCita(cita)"><i
                        class="fa-solid fa-check"></i></ButtonRounded>
                <ButtonRounded color="bg-red-300 w-[25px]! h-[25px]!" @click="cancelarCita(cita)"><i
                        class="fa-solid fa-xmark"></i></ButtonRounded>
            </div>
            <div class="flex flex-col gap-2" v-if="cita.estado === 'cancelada'">
                <ButtonRounded color="bg-gray-400 w-[25px]! h-[25px]!" @click="showMotivo(cita)"><i
                        class="fa-solid fa-info"></i></ButtonRounded>
            </div>
            <div class="flex flex-col gap-2" v-if="cita.estado === 'Realizada'">
                <ButtonRounded color="bg-green-400 w-[25px]! h-[25px]!" @click="showObservacion(cita)"><i
                        class="fa-solid fa-info"></i></ButtonRounded>
            </div>
        </div>

        <div v-if="citasFiltradas.length < 1" class="w-full py-8 flex justify-center">
            <h2 class="text-lg text-gray-500">No hay citas programadas.</h2>
        </div>
    </div>

    <Historia v-if="showNuevaHistoria" :showHistoria="showNuevaHistoria"  @ocultar="showNuevaHistoria = false"/>
</template>