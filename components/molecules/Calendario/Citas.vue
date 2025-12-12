<script setup>
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import Historia from '~/components/Historia.vue';

import { useCalendarioCitas } from '~/stores/Calendario.js'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useDatosServicioStore } from '~/stores/Formularios/empresa/Servicio'
import { computed, ref } from 'vue';
import { nombresMeses } from '~/data/Fechas.js'
import { validarYEnviarCancelarCita } from '~/Core/Usuarios/Cita/CancelarCita';
import { storeToRefs } from 'pinia';
import { useOrdenamiento } from '~/composables/Tabla/useDatosOrdenadosTabla';
import { usePaginacion } from '~/composables/Tabla/usePaginacion';

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

const varView = useVarView();
const calendarioCitasStore = useCalendarioCitas();
const historiasStore = useHistoriasStore();
const pacientesStore = usePacientesStore();
const servicioStore = useDatosServicioStore();
const Citas = ref(props.Propiedades.citas);
const notificacionesStore = useNotificacionesStore();

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

const {
    busqueda,
    filtros,
    filtrosConOpciones,
    datosOrdenados,
    borrarFiltros
} = useOrdenamiento(props.Propiedades.citas || ref([]), props.Propiedades.filtros);

const {
    paginaActual,
    itemsPorPagina,
    totalPaginas,
    ultimaPagina,
    cambiarItemsPorPagina,
    siguientePagina,
    paginaAnterior,
    irAPagina,
    datosPaginados,
} = usePaginacion(datosOrdenados);

// Al buscar cambia a primera pagina
watch(busqueda, (nuevoValor, anteriorValor) => {
    if (nuevoValor !== anteriorValor) {
        paginaActual.value = 1;
    }
});

watch(filtros, (nuevoValor, anteriorValor) => {
    paginaActual.value = 1;
}, { deep: true });


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
    options.texto = cita.motivo_cancelacion ? `${cita.motivo_cancelacion}` : 'Cita cancelada!';
    options.tiempo = 5000;
    simple();
}

async function showObservacion(cita) {
    const historia = await historiasStore.listDatos(cita.id_examen_fisico, 'Analisis', 'id')
    const observacion = historia[0]?.observacion
    options.icono = "info";
    options.titulo = "Observacion del Profesional";
    options.texto = observacion ? `${observacion}` : 'Cita Realizada con exito!';
    options.tiempo = 5000;
    simple();
}

async function activarCita(cita) {
    let pacientes = pacientesStore.Pacientes

    if (pacientes.length < 1) {
        pacientes = await pacientesStore.listPacientes(false)
    }
    const pacienteCita = pacientes.filter(data => {
        return data.id_paciente === cita.id_paciente
    })?.[0];

    historiasStore.Formulario.HistoriaClinica.name_paciente = cita.name_paciente
    historiasStore.Formulario.HistoriaClinica.type_doc_paciente = pacienteCita.type_doc
    historiasStore.Formulario.HistoriaClinica.No_document_paciente = pacienteCita.No_document
    historiasStore.Formulario.HistoriaClinica.id_paciente = cita.id_paciente
    historiasStore.Formulario.Analisis.servicio = cita.servicio

    historiasStore.Formulario.Cita = cita

    const servicios = await servicioStore.listServicios()
    varView.tipoConsulta = servicios.find((s) => {
        return s.name === cita.servicio
    })

    // varView.tipoConsulta = cita.servicio
    if (varView.tipoConsulta.plantilla === 'Terapia') {
        historiasStore.Formulario.Terapia.id_paciente = cita.id_paciente
        historiasStore.Formulario.Terapia.id_profesional = cita.id_medico
        historiasStore.Formulario.Terapia.id_procedimiento = cita.id_procedimiento
        historiasStore.Formulario.Terapia.fecha = cita.fecha
        historiasStore.Formulario.Terapia.hora = cita.hora
    } else if (varView.tipoConsulta.plantilla === 'Nota') {
        historiasStore.Formulario.Nota.id_paciente = cita.id_paciente
        historiasStore.Formulario.Nota.id_profesional = cita.id_medico
        historiasStore.Formulario.Nota.id_procedimiento = cita.id_procedimiento
        historiasStore.Formulario.Nota.direccion = pacienteCita.direccion
        historiasStore.Formulario.Nota.fecha_nota = cita.fecha
        historiasStore.Formulario.Nota.hora_nota = cita.hora
    } else if (varView.tipoConsulta.plantilla === 'Medicina') {
        const antecedentes = await historiasStore.listDatos(cita.id_paciente, 'Antecedentes', 'id_paciente')

        historiasStore.Formulario.AntecedentesRegistrados = antecedentes
    }
    varView.showNuevaHistoria = true
}

</script>

<template>
    <!-- Header y filtros -->
    <div v-if="props.Propiedades.showTodas"
        class="flex md:flex-row flex-col justify-between items-end px-6 py-3 dark:bg-[rgba(0,0,0,0.1)] bg-gray-100 rounded-xl">
        <div class="md:w-1/3 w-full">
            <div class="flex gap-2">
                <h2 class="text-xl font-semibold">Registro completo de Agenda</h2>
                <span v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '')" class="dark:text-gray-400 text-gray-600 cursor-pointer"
                    @click="borrarFiltros"> <i class="fa-solid fa-close"></i> Borrar filtros</span>
            </div>
            <Input :Propiedades="{
                placeholder: 'Buscar dato en citas...',
                icon: 'fa-solid fa-search',
                modelValue: busqueda,
                tamaño: 'w-full',
                upperCase: true,
                estilo: 'bg-white dark:bg-gray-900'
            }" v-model="busqueda" />
        </div>
        <div class="flex gap-3 md:w-1/3 w-full md:mt-0 mt-4">
            <Select v-for="(filtro, key) in filtrosConOpciones" :key="key" :Propiedades="{
                placeholder: 'Todos',
                label: filtro.placeholder,
                modelValue: busqueda,
                tamaño: 'w-full',
                estilo: 'bg-white dark:bg-gray-900',
                options: [{ text: 'Todos', value: '' }, ...filtro.datos,],
            }" v-model="filtros[filtro.columna]" />
        </div>
    </div>
    <!--Citas  -->
    <div :class="props.Propiedades.estilos"
        class="py-5 flex flex-col gap-3 border border-gray-300 dark:border-gray-600 rounded-2xl h-110 overflow-y-auto bg-white dark:bg-gray-700 scrollForm">
        <h2 v-if="!props.Propiedades.showTodas" class="text-xl font-semibold my-2 px-10">{{
            calendarioCitasStore.diaSemana }}, {{ dias }} {{ mes }}</h2>
        <!-- Card Citas -->
        <div class="py-4 mx-5 lg:px-10 md:px-5 px-2 flex flex-col md:flex-row justify-between items-center pb-2 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-lg dark:shadow-gray-800"
            v-for="cita in props.Propiedades.showTodas ? datosPaginados : citasFiltradas"
            :class="[{ 'bg-red-50 dark:bg-gray-900': cita.estado === 'cancelada' }, props.Propiedades.tamaño]">
            <div class="flex gap-5 items-center md:flex-col lg:flex-row flex-row">
                <div class="flex flex-col items-center">
                    <h2 class="text-blue-500 text-lg font-bold">{{ cita.hora }}</h2>
                    <p class="text-xs text-gray-500 dark:text-gray-200">{{ props.Propiedades.showTodas ? cita.fecha :
                        fechaCita }}</p>
                </div>
                <div>
                    <p class="font-semibold">{{ cita.name_paciente }}</p>
                    <p class="text-sm text-gray-700 dark:text-gray-300">{{ cita.servicio }}</p>
                </div>
            </div>
            <div class="flex md:w-2/4 w-3/4 justify-between flex-row md:mt-0 mt-5">
                <div class="flex flex-col gap-2">
                    <h3 class="text-sm flex gap-2 items-center"> <i class="fa-solid fa-user-doctor text-gray-500"></i>
                        {{ cita.name_medico }}</h3>
                    <h3 class="text-sm"><i class="fa-solid fa-stethoscope text-blue-500"></i> {{ cita.motivo }}</h3>
                </div>
                <!-- Acciones -->
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
        </div>

        <div v-if="citasFiltradas.length < 1 && !props.Propiedades.showTodas || datosOrdenados.length < 1"
            class="w-full py-8 flex justify-center">
            <h2 class="text-lg text-gray-500">No hay citas programadas.</h2>
        </div>
    </div>
    <!-- Paginador -->
    <div v-if="props.Propiedades.showTodas" class="mt-[10px] flex justify-between items-center h-[30px] px-10">
        <p class="text-sm text-gray-500 md:block hidden">
            Registros {{ ultimaPagina - itemsPorPagina + 1 }} al {{ ultimaPagina }}</p>

        <div class="btnsPagina flex items-center gap-3">
            <button v-if="paginaActual > 1"
                class="text-l p-2 text-white w-[30px] h-[30px] flex justify-center items-center rounded-full cursor-pointer"
                @click="paginaAnterior()">
                <i class="fa-solid fa-angle-left"></i>
            </button>
            <div class="flex gap-2 pagina">
                <h2 v-if="paginaActual > 1" @click="irAPagina(paginaActual - 1)"
                    class="text-gray-600 hover:bg-gray-200 dark:bg-gray-700 hover:dark:bg-gray-600 dark:text-gray-300 cursor-pointer flex justify-center items-center px-2 w-[30px] h-[30px] rounded-full">
                    {{ paginaActual - 1 }}</h2>
                <h2
                    class="bg-gray-300 dark:bg-gray-800 dark:text-gray-300 text-gray-600 flex justify-center items-center px-2 w-[30px] h-[30px] rounded-full">
                    {{ paginaActual }}</h2>
                <h2 v-if="paginaActual < totalPaginas" @click="irAPagina(paginaActual + 1)"
                    class="text-gray-600 hover:bg-gray-200 dark:bg-gray-700 hover:dark:bg-gray-600 dark:text-gray-300 cursor-pointer flex justify-center items-center px-2 w-[30px] h-[30px] rounded-full">
                    {{ paginaActual + 1 }}</h2>
            </div>
            <button v-if="paginaActual != totalPaginas"
                class="text-l p-2 text-white w-[30px] h-[30px] flex justify-center items-center rounded-full cursor-pointer"
                @click="siguientePagina()">
                <i class="fa-solid fa-angle-right"></i>
            </button>
        </div>

        <div class="flex gap-2 items-center">
            <p class="text-sm text-gray-500 md:block hidden">Número de registros</p>
            <select name="numRegistros" class="text-black bg-gray-200 rounded-xl p-1 cursor-pointer"
                @change="cambiarItemsPorPagina($event.target.value)">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="20">20</option>
                <option value="50">50</option>
            </select>
        </div>
    </div>

    <Historia v-if="varView.showNuevaHistoria" />
</template>

<style>
.btnsPagina button {
    background: linear-gradient(to left, var(--color-default), var(--color-default-700));
}
</style>