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
import { useCitasStore } from '~/stores/Formularios/citas/Cita';
import { mapCampos } from '~/components/organism/Forms/useFormulario';

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
const citasStore = useCitasStore();
const servicioStore = useDatosServicioStore();
const Citas = ref(props.Propiedades.citas);
const notificacionesStore = useNotificacionesStore();
const puedePut = ref(varView.getPermisos.includes('Citas_put'))
const puedeDelete = ref(varView.getPermisos.includes('Citas_delete'))
const showPendientes = ref(false)

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
} = usePaginacion(datosOrdenados, 9);

// Al buscar cambia a primera pagina
watch(busqueda, (nuevoValor, anteriorValor) => {
    if (nuevoValor !== anteriorValor) {
        paginaActual.value = 1;
    }
}, { deep: true });

watch(filtros, (nuevoValor, anteriorValor) => {
    paginaActual.value = 1;
}, { deep: true });

// Citas filtradas segun dia seleccionado
const citasFiltradas = computed(() => {
    return Citas.value?.filter(cita => {
        if (!cita.fecha || cita.estado === 'cancelada') return false;

        const fechaInicio = new Date(cita.fecha);
        const fechaFin = cita.fechaHasta ? new Date(cita.fechaHasta) : null;
        const fechaSeleccionada = new Date(fecha.value.split('/').reverse().join('-'));

        if (fechaFin) {
            if (cita.estado === 'Inactiva' && fecha.value === fechaActual.value) {
                return fechaSeleccionada >= fechaInicio && fechaSeleccionada <= fechaFin;
            } else {
                return fechaSeleccionada.getTime() === fechaInicio.getTime();
            }
        } else {
            return fechaSeleccionada.getTime() === fechaInicio.getTime();
        }
    });
});

// Computada para ordenar por fecha_nota descendente
const citasOrdenadas = computed(() => {
  return [...datosPaginados.value].sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha)
  })
})


// Pendientes
const pendientes = computed(() => {
    return Citas.value?.filter(cita => {
        if (!cita.fecha) return false;
        const fechaInicio = new Date(cita.fecha);
        const fechaActualDate = new Date(fechaActual.value.split('/').reverse().join('-'));
        return fechaInicio < fechaActualDate && cita.estado === 'Inactiva';
    }) ?? [];
});

// Nombre del mes
const mes = computed(() => {
    const [dia, mes, anio] = fecha.value.split('/').map(Number);
    return nombresMeses[mes - 1]
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

const actualizarCita = (cita) => {
    mapCampos(cita, citasStore.Formulario);
    if (cita.motivo === 'Atención domiciliaria') {
        varView.rangoCita = true
    } else {
        varView.rangoCita = false
    }
    varView.showActualizarCita = true
}

function showMotivo(cita) {
    options.icono = "info";
    options.titulo = "Motivo de cancelacion";
    options.texto = cita.motivo_cancelacion ? `${cita.motivo_cancelacion}` : 'Cita cancelada!';
    options.tiempo = 5000;
    simple();
}

function showMotivoEdicion(cita) {
    options.icono = "info";
    options.titulo = "Motivo de edición";
    options.texto = cita.motivo_edicion ? `${cita.motivo_edicion}` : 'La cita ha sido editada!';
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

function parseFechaISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d); // siempre local, sin UTC
}

function changeShowPendientes() {
    showPendientes.value = !showPendientes.value
}

async function activarCita(cita) {
    if (!cita.fechaHasta) {
        cita.fechaHasta = cita.fecha
    }

    // Obtener horas y minutos
    const fechaHoy = new Date();
    const horas = fechaHoy.getHours().toString().padStart(2, '0');
    const minutos = fechaHoy.getMinutes().toString().padStart(2, '0');

    // Formato HH:MM
    const horaActual = `${horas}:${minutos}`;

    const fechaHoyC = parseFechaISO(new Date().toISOString().split('T')[0]);
    const fechaHasta = parseFechaISO(cita.fechaHasta);

    if (fechaHoyC > fechaHasta) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Rango vencido';
        notificacionesStore.options.texto = 'Consulta con un administrador para habilitar Cita!'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return
    }


    let pacientes = pacientesStore.Pacientes

    if (pacientes.length < 1) {
        pacientes = await pacientesStore.listPacientes(false)
    }
    const pacienteCita = pacientes.filter(data => {
        return data.id_paciente === cita.id_paciente
    })?.[0];

    if (!pacienteCita) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No se encontro el paciente';
        notificacionesStore.options.texto = 'Verifica si existe en la lista de pacientes.'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return
    }

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

    if (!varView.tipoConsulta) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No se encontro el tipo de servicio';
        notificacionesStore.options.texto = ''
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return
    }

    // varView.tipoConsulta = cita.servicio
    if (varView.tipoConsulta.plantilla === 'Terapia') {
        historiasStore.Formulario.Terapia.id_paciente = cita.id_paciente
        historiasStore.Formulario.Terapia.id_profesional = cita.id_medico
        historiasStore.Formulario.Terapia.id_procedimiento = cita.id_procedimiento
        historiasStore.Formulario.Terapia.fecha = fecha.value.split('/').reverse().join('-') || cita.fecha
        historiasStore.Formulario.Terapia.hora = horaActual || cita.hora
    } else if (varView.tipoConsulta.plantilla === 'Nota') {
        historiasStore.Formulario.Nota.id_paciente = cita.id_paciente
        historiasStore.Formulario.Nota.id_profesional = cita.id_medico
        historiasStore.Formulario.Nota.id_procedimiento = cita.id_procedimiento
        historiasStore.Formulario.Nota.direccion = pacienteCita.direccion
        historiasStore.Formulario.Nota.fecha_nota = fecha.value.split('/').reverse().join('-') || cita.fecha
        historiasStore.Formulario.Nota.hora_nota = horaActual || cita.hora
    } else if (varView.tipoConsulta.plantilla === 'Medicina') {
        // const antecedentes = await historiasStore.listDatos(cita.id_paciente, 'Antecedentes', 'id_paciente')

        // historiasStore.Formulario.Antecedentes = antecedentes
    }
    varView.showNuevaHistoria = true
}

</script>

<template>
    <!-- Header y filtros -->
    <div v-if="props.Propiedades.showTodas"
        class="flex md:flex-row flex-col justify-between items-end px-6 py-3 bg-white dark:bg-gray-700 border-1 border-gray-300 dark:border-gray-600 rounded-xl">
        <div class="md:w-1/3 w-full">
            <div class="flex gap-2">
                <h2 class="text-xl font-semibold">Registro completo de Agenda</h2>
                <ButtonRounded v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '')"
                    color="dark:text-gray-400 dark:bg-gray-800 !text-gray-700 bg-gray-300" tooltip="Borrar Filtros"
                    tooltipPosition="right" @click="borrarFiltros">
                    <i class="fa-solid fa-close"></i>
                </ButtonRounded>
            </div>
            <Input :Propiedades="{
                placeholder: 'Buscar dato en citas...',
                icon: 'fa-solid fa-search',
                modelValue: busqueda,
                tamaño: 'w-full',
                upperCase: true,
                estilo: 'bg-gray-50 dark:bg-gray-800'
            }" v-model="busqueda" />
        </div>
        <div class="flex gap-3 md:w-1/3 w-full md:mt-0 mt-4">
            <Select v-for="(filtro, key) in filtrosConOpciones" :key="key" :Propiedades="{
                placeholder: 'Todos',
                label: filtro.placeholder,
                modelValue: busqueda,
                tamaño: 'w-full',
                estilo: 'bg-gray-50 dark:bg-gray-800',
                options: [{ text: 'Todos', value: '' }, ...filtro.datos,],
            }" v-model="filtros[filtro.columna]" />
        </div>
    </div>
    <!--Citas  -->
    <div :class="props.Propiedades.estilos"
        class="py-5 flex flex-col gap-3 border border-gray-300 dark:border-gray-600 rounded-2xl md:h-[62vh] h-[50vh] overflow-y-auto bg-white dark:bg-gray-700 scrollForm">
        <h2 v-if="!props.Propiedades.showTodas" class="text-xl font-semibold my-2 px-10">
            {{ calendarioCitasStore.diaSemana }}, {{ dias }} {{ mes }}
        </h2>

        <!-- Citas Pendientes -->
        <div v-if="fechaActual === fecha && pendientes.length > 1 && !props.Propiedades.showTodas">
            <div class="flex items-center justify-between my-2 px-5">
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-hourglass-half text-red-300"></i>
                    <h2 class="text-xl font-semibold">Citas Pendientes</h2>
                </div>
                <ButtonRounded
                    :color="!showPendientes ? 'bg-gray-300 dark:bg-gray-800 text-gray-700 dark:text-gray-400' : 'bg-blue-500 hover:bg-blue-600 text-white'"
                    tooltip="Mostrar/Ocultar Pendientes" tooltipPosition="top" @click="changeShowPendientes">
                    <i :class="!showPendientes ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                </ButtonRounded>
            </div>

            <div class="grid gap-2 px-4" v-if="showPendientes"
                :class="{ 'xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2': varView.showEnFila || !varView.showCalendario, 'xl:grid-cols-2 lg:grid-cols-1': !varView.showEnFila }">
                <div class="w-full flex flex-col gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-gray-900 transition hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    v-for="cita in pendientes.reverse()"
                    :class="[{ 'bg-red-50 dark:bg-gray-900': cita.estado === 'cancelada' }, props.Propiedades.tamaño]">

                    <!-- HEADER -->
                    <div class="flex items-center gap-4">
                        <div
                            class="flex flex-col items-center text-blue-600 ml-1 border-r-2 border-gray-300 dark:border-gray-700 pr-3">
                            <h2 class="text-blue-600 text-lg font-extrabold">
                                {{ cita.hora === '00:00:00' ? cita.fechaHasta.substring(5, 11) : cita.hora ?
                                    cita.hora.substring(0, 5) : '' }}
                            </h2>
                            <p class="text-xs text-gray-500 dark:text-gray-300">
                                {{ cita.fecha }}
                            </p>
                        </div>
                        <div class="flex flex-col gap-1">
                            <div class="text-base font-semibold text-gray-800 dark:text-gray-100">{{ cita.name_paciente
                            }}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">{{ cita.servicio }}</div>
                        </div>
                    </div>
                    <!-- BODY -->
                    <div class="space-y-2">
                        <div class="w-full h-3">
                            <h3 class="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <i class="w-[25px] fa-solid fa-user-doctor text-gray-500"></i> {{ cita.name_medico }}
                            </h3>
                        </div>
                        <div class="w-3/4 h-3">
                            <h3 class="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <i class="w-[25px] fa-solid fa-stethoscope text-blue-500"></i> {{ cita.motivo }}
                            </h3>
                        </div>
                    </div>
                    <!-- FOOTER -->
                    <div class="flex flex-col gap-2 pt-2">
                        <div class="flex w-full justify-between gap-3 mt-3 rounded-full"
                            v-if="cita.estado === 'Inactiva'">
                            <ButtonRounded
                                color="bg-danger hover:bg-red-600 text-white w-[90px]! h-[28px]! font-bold text-xs gap-1 shadow-sm"
                                tooltip="Cancelar" tooltipPosition="top"
                                @click="puedeDelete ? cancelarCita(cita) : () => { }">
                                <i class="fa-solid fa-xmark"></i> Cancelar
                            </ButtonRounded>

                            <ButtonRounded
                                color="bg-amber-500 hover:bg-amber-600 text-white w-[90px]! h-[28px]! font-bold text-xs gap-1 shadow-sm"
                                tooltip="Editar" tooltipPosition="top"
                                @click="puedePut ? actualizarCita(cita) : () => { }">
                                <i class="fa-solid fa-pencil"></i> Editar
                            </ButtonRounded>

                            <ButtonRounded
                                color="bg-green-500 hover:bg-green-500 text-white w-[90px]! h-[28px]! font-bold text-xs gap-1 shadow-sm"
                                tooltip="Completar Cita" tooltipPosition="top" @click="activarCita(cita)">
                                <i class="fa-solid fa-check"></i> Asistir
                            </ButtonRounded>
                        </div>
                        <div class="">
                            <!-- Estado Editada -->
                            <div v-if="cita.estado === 'Inactiva' && cita.motivo_edicion">
                                <ButtonRounded
                                    color="bg-amber-500 hover:bg-amber-700 text-white w-[30px]! h-[30px]! shadow-sm"
                                    tooltip="Observación" tooltipPosition="top" @click="showMotivoEdicion(cita)">
                                    <i class="fa-solid fa-info"></i>
                                </ButtonRounded>
                            </div>

                            <!-- Estado Cancelada -->
                            <div v-if="cita.estado === 'cancelada'">
                                <ButtonRounded
                                    color="bg-gray-500 hover:bg-gray-600 text-white w-[30px]! h-[30px]! shadow-sm"
                                    tooltip="Información" tooltipPosition="top" @click="showMotivo(cita)">
                                    <i class="fa-solid fa-info"></i>
                                </ButtonRounded>
                            </div>

                            <!-- Estado Realizada -->
                            <div v-if="cita.estado === 'Realizada'">
                                <ButtonRounded
                                    color="bg-blue-600 hover:bg-blue-700 text-white w-[30px]! h-[30px]! shadow-sm"
                                    tooltip="Observación" tooltipPosition="top" @click="showObservacion(cita)">
                                    <i class="fa-solid fa-info"></i>
                                </ButtonRounded>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div class="flex items-center my-2 px-5 gap-2">
                <i class="fa-solid fa-calendar-day text-blue-300"></i>
                <h2 class="text-xl font-semibold">Citas de Hoy</h2>
            </div>
        </div>

        <!-- Citas de Hoy -->
        <div class="grid gap-2 px-4"
            :class="{ 'lg:grid-cols-3 md:grid-cols-2': varView.showEnFila || !varView.showCalendario, 'xl:grid-cols-2 md:grid-cols-1': !varView.showEnFila }">
            <!-- Card Citas -->

            <template v-if="!unref(props.Propiedades.citas)">
                <div v-for="i in 2" :key="i" :class="Propiedades.tamaño"
                    class="w-full p-4 shadow-md bg-white dark:bg-gray-700 flex flex-col gap-4 animate-pulse">
                    <!-- HEADER -->
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        <div class="flex flex-col gap-2">
                            <div class="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div class="w-20 h-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                        </div>
                    </div>
                    <!-- BODY -->
                    <div class="space-y-2">
                        <div class="w-full h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div class="w-3/4 h-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                    </div>
                    <!-- FOOTER -->
                    <div class="flex gap-2 pt-2">
                        <div class="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div class="w-16 h-6 bg-gray-200 dark:bg-gray-500 rounded-full"></div>
                    </div>
                </div>
            </template>

            <div class="w-full flex flex-col gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-gray-900 transition hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                v-for="cita in props.Propiedades.showTodas ? citasOrdenadas : citasFiltradas"
                :class="[{ 'bg-red-50 dark:bg-gray-900': cita.estado === 'cancelada' }, props.Propiedades.tamaño]">

                <!-- HEADER -->
                <div class="flex items-center gap-4">
                    <div
                        class="flex flex-col items-center text-blue-600 ml-1 border-r-2 border-gray-300 dark:border-gray-700 pr-3">
                        <h2 class="text-blue-600 text-lg font-extrabold">
                            {{ cita.hora === '00:00:00' ? cita.fechaHasta.substring(5, 11) : cita.hora ?
                                cita.hora.substring(0, 5) : '' }}
                        </h2>
                        <p class="text-xs text-gray-500 dark:text-gray-300">
                            {{ props.Propiedades.showTodas ? cita.fecha : fechaCita }}
                        </p>
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="text-base font-semibold text-gray-800 dark:text-gray-100">{{ cita.name_paciente
                        }}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">{{ cita.servicio }}</div>
                    </div>
                </div>
                <!-- BODY -->
                <div class="space-y-2">
                    <div class="w-full h-3">
                        <h3 class="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <i class=" w-[25px] fa-solid fa-user-doctor text-gray-500"></i> {{ cita.name_medico }}
                        </h3>
                    </div>
                    <div class="w-3/4 h-3 mt-1">
                        <h3 class="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <i class="w-[25px] fa-solid fa-stethoscope text-blue-500"></i> {{ cita.motivo }}
                        </h3>
                    </div>
                </div>
                <!-- FOOTER -->
                <div class="flex flex-col gap-2 pt-2">
                    <div class="flex gap-2 w-full justify-between" v-if="cita.estado === 'Inactiva'">
                        <ButtonRounded
                            color="bg-danger hover:bg-red-600 text-white w-[90px]! h-[28px]! font-bold text-xs gap-1 shadow-sm"
                            tooltip="Cancelar" tooltipPosition="top"
                            @click="puedeDelete ? cancelarCita(cita) : () => { }">
                            <i class="fa-solid fa-xmark"></i> Cancelar
                        </ButtonRounded>

                        <ButtonRounded
                            color="bg-amber-500 hover:bg-amber-600 text-white w-[90px]! h-[28px]! font-bold text-xs gap-1 shadow-sm"
                            tooltip="Editar" tooltipPosition="top" @click="puedePut ? actualizarCita(cita) : () => { }">
                            <i class="fa-solid fa-pencil"></i> Editar
                        </ButtonRounded>

                        <ButtonRounded
                            color="bg-green-500 hover:bg-green-500 text-white w-[90px]! h-[28px]! font-bold text-xs gap-1 shadow-sm"
                            tooltip="Completar Cita" tooltipPosition="top" @click="activarCita(cita)">
                            <i class="fa-solid fa-check"></i> Asistir
                        </ButtonRounded>
                    </div>
                    <div class="flex">
                        <!-- Estado Editada -->
                        <div v-if="cita.estado === 'Inactiva' && cita.motivo_edicion">
                            <ButtonRounded
                                color="bg-amber-500 hover:bg-amber-700 text-white w-[30px]! h-[30px]! shadow-sm"
                                tooltip="Observación" tooltipPosition="top" @click="showMotivoEdicion(cita)">
                                <i class="fa-solid fa-info"></i>
                            </ButtonRounded>
                        </div>

                        <!-- Estado Cancelada -->
                        <div v-if="cita.estado === 'cancelada'">
                            <ButtonRounded
                                color="bg-gray-500 hover:bg-gray-600 text-white w-[30px]! h-[30px]! shadow-sm"
                                tooltip="Información" tooltipPosition="top" @click="showMotivo(cita)">
                                <i class="fa-solid fa-info"></i>
                            </ButtonRounded>
                        </div>

                        <!-- Estado Realizada -->
                        <div v-if="cita.estado === 'Realizada'">
                            <ButtonRounded
                                color="bg-blue-600 hover:bg-blue-700 text-white w-[30px]! h-[30px]! shadow-sm"
                                tooltip="Observación" tooltipPosition="top" @click="showObservacion(cita)">
                                <i class="fa-solid fa-info"></i>
                            </ButtonRounded>
                        </div>
                    </div>
                </div>

            </div>

        </div>

        <div v-if="citasFiltradas.length < 1 && !props.Propiedades.showTodas || datosOrdenados.length < 1"
            class="w-full py-8 flex justify-center">
            <h2 class="text-lg text-gray-500">No hay citas programadas.</h2>
        </div>

    </div>
    <!-- Paginador -->
    <div v-if="props.Propiedades.showTodas" class="mt-[10px] flex gap-3 justify-between items-center h-[30px] px-10">
        <div class="text-sm md:flex gap-1 hidden">
            <p class="text-gray-500">Registros {{ ultimaPagina - itemsPorPagina + 1 }} al {{ ultimaPagina }}</p>
            <p class="text-gray-500">de {{ datosOrdenados.length }}</p>
        </div>

        <div class="btnsPagina flex items-center gap-3">
            <ButtonRounded v-if="paginaActual > 2" tooltip="Ir a Primera Pagina"
                color="text-l p-2 text-white !w-[30px] !h-[30px] flex justify-center items-center rounded-full cursor-pointer md:mr-4"
                @click="irAPagina(1)">
                <i class="fa-solid fa-angles-left"></i>
            </ButtonRounded>
            <ButtonRounded v-if="paginaActual > 1" tooltip="Atras"
                color="text-l p-2 text-white !w-[30px] !h-[30px] flex justify-center items-center rounded-full cursor-pointer"
                @click="paginaAnterior()">
                <i class="fa-solid fa-angle-left"></i>
            </ButtonRounded>
            <div class="flex gap-2 pagina">
                    <!-- Página anterior -->
                    <h2 v-if="paginaActual === totalPaginas && paginaActual > 1" @click="irAPagina(paginaActual - 1)"
                        class="text-gray-600 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer flex justify-center items-center w-[30px] h-[30px] rounded-full transition-all">
                        {{ paginaActual - 1 }}
                    </h2>

                    <!-- Página actual -->
                    <h2
                        class="bg-gray-400 text-white dark:bg-gray-600 dark:text-gray-100 flex justify-center items-center w-[30px] h-[30px] rounded-full shadow-sm font-semibold">
                        {{ paginaActual }}
                    </h2>

                    <!-- Página siguiente -->
                    <h2 v-if="paginaActual < totalPaginas" @click="irAPagina(paginaActual + 1)"
                        class="text-gray-600 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer flex justify-center items-center w-[30px] h-[30px] rounded-full transition-all">
                        {{ paginaActual + 1 }}
                    </h2>

                    <!-- Última página -->
                    <div v-if="paginaActual < totalPaginas - 1" class="flex gap-1 items-center">
                        <p v-if="paginaActual + 2 !== totalPaginas" class="text-gray-500 dark:text-gray-400">...</p>
                        <h2 @click="irAPagina(totalPaginas)" aria-label="Ir a última página"
                            class="bg-gray-300 text-gray-600 hover:bg-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500 cursor-pointer flex justify-center items-center w-[30px] h-[30px] rounded-full shadow-sm transition-all font-semibold">
                            {{ totalPaginas }}
                        </h2>
                    </div>
            </div>
            <ButtonRounded v-if="paginaActual != totalPaginas" tooltip="Siguiente"
                color="text-l p-2 text-white !w-[30px] !h-[30px] flex justify-center items-center rounded-full cursor-pointer"
                @click="siguientePagina()">
                <i class="fa-solid fa-angle-right"></i>
            </ButtonRounded>
        </div>

        <div class="flex gap-2 items-center">
            <p class="text-sm text-gray-500 md:block hidden">Número de registros</p>
            <select name="numRegistros" class="text-black bg-gray-200 rounded-xl p-1 cursor-pointer"
                @change="cambiarItemsPorPagina($event.target.value)">
                <option value="6">6</option>
                <option value="9" selected>9</option>
                <option value="12">12</option>
                <option value="15">15</option>
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