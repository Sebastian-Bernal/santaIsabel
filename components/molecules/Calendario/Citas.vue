<script setup>
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import Input from '~/components/atoms/Inputs/Input.vue';

import { useCalendarioCitas } from '~/stores/Calendario.js'
import { computed, ref } from 'vue';
import { nombresMeses } from '~/data/Fechas.js'
import { storeToRefs } from 'pinia';
import { useOrdenamiento } from '~/composables/Tabla/useDatosOrdenadosTabla';
import { usePaginacion } from '~/composables/Tabla/usePaginacion';
import { useCitasActions } from '~/composables/Usuarios/Citas';

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
const Citas = ref(props.Propiedades.citas);
const puedePut = ref(varView.getPermisos.includes('Citas_put'))
const puedeDelete = ref(varView.getPermisos.includes('Citas_delete'))
const showPendientes = ref(false)
const mostrarFiltrosAvanzados = ref(false)

const {
    fechaActual,
    fecha,
    dias,
    meses,
} = storeToRefs(calendarioCitasStore);

const {
    busqueda,
    filtros,
    filtrosConOpciones,
    datosOrdenados,
    borrarFiltros
} = useOrdenamiento(props.Propiedades.citas || ref([]), props.Propiedades.filtros, ['name_medico']);

// Computada para ordenar por fecha_nota descendente
const citasOrdenadas = computed(() => {
    return [...datosOrdenados.value].sort((a, b) => {
        return new Date(b.fecha) - new Date(a.fecha)
    })
});

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
} = usePaginacion(citasOrdenadas, 9);

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

function vencida(cita) {
  if (!cita.fechaHasta) {
    cita.fechaHasta = cita.fecha
  }

  const now = new Date()
  const fechaHoy = parseFechaISO(now.toISOString().split('T')[0])
  const fechaHasta = parseFechaISO(cita.fechaHasta)

  return fechaHoy > fechaHasta
}

const {
    cancelarCita,
    activarCita,
    actualizarCita,
    showMotivoCancelacion,
    showMotivoEdicion,
    showObservacion,
    parseFechaISO
} = useCitasActions({
    fecha
})


function changeShowPendientes() {
    showPendientes.value = !showPendientes.value
}

</script>

<template>
    <!-- Header y filtros -->

    <div v-if="props.Propiedades.showTodas"
        class="w-full mt-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-2">
                <i class="fa-solid fa-filter text-gray-400"></i>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Registro completo de Agenda
                    <span v-if="Object.values(filtros).some(v => v !== '')"
                        class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        Filtros activos
                    </span>
                </p>
            </div>

            <div class="flex gap-2">
                <ButtonRounded v-if="filtrosConOpciones.length > 3"
                    @click="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados"
                    :color="mostrarFiltrosAvanzados ? 'bg-blue-800 dark:bg-blue-700' : 'bg-gray-800 text-gray-700 dark:bg-gray-700 dark:text-gray-200'"
                    tooltip="Filtros Avanzados">
                    <i class="fa-solid fa-sliders"></i>
                </ButtonRounded>
                <ButtonRounded v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '')"
                    color="dark:text-gray-200 dark:bg-red-600 bg-red-400" tooltip="Limpiar filtros"
                    tooltipPosition="top" @click="borrarFiltros">
                    <i class="fa-solid fa-xmark"></i>
                </ButtonRounded>
            </div>
        </div>
        <div class="flex flex-wrap items-end justify-between gap-3"">
                <Input :Propiedades="{
                    placeholder: 'Buscar dato en Citas...', icon: 'fa-solid fa-search',
                    modelValue: busqueda, tamaño: 'w-full sm:w-2/5', upperCase: true, estilo: 'bg-white dark:bg-gray-900'
                }"
            v-model="busqueda" />

        <div class="flex flex-wrap justify-end gap-3">
            <Select v-for="(filtro, key) in filtrosConOpciones.slice(0, 3)" :key="key" :Propiedades="{
                placeholder: filtro.placeholder,
                label: filtro.placeholder,
                modelValue: busqueda,
                tamaño: 'md:w-[180px] w-full',
                estilo: 'bg-white dark:bg-gray-900',
                options: [{ text: 'Todos', value: '' }, ...filtro.datos,],
            }" v-model="filtros[filtro.columna]" />
        </div>
    </div>
    <div v-if="mostrarFiltrosAvanzados"
        class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-end">
        <Select v-for="(filtro, key) in filtrosConOpciones.slice(3)" :key="key" :Propiedades="{
            placeholder: filtro.placeholder,
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
        class="py-5 flex flex-col gap-3 border border-gray-300 dark:border-gray-600 rounded-2xl md:h-[62vh] h-[50vh] overflow-y-auto bg-white dark:bg-gray-700 scrollForm">
        <h2 v-if="!props.Propiedades.showTodas" class="text-xl font-semibold my-2 px-10">
            {{ calendarioCitasStore.diaSemana }}, {{ dias }} {{ mes }}
        </h2>

        <!-- Citas Pendientes -->
        <div v-if="fechaActual === fecha && pendientes.length > 1 && !props.Propiedades.showTodas">
            <div class="flex items-center justify-between my-2 px-5">
                <div class="flex items-center gap-2 mr-5">
                    <i class="fa-solid fa-hourglass-half text-red-300"></i>
                    <h2 class="text-xl font-semibold select-none cursor-pointer" @click="changeShowPendientes">Citas Pendientes</h2>
                </div>
                <ButtonRounded
                    :color="!showPendientes ? 'bg-gray-400 dark:bg-gray-800 text-gray-700 dark:text-gray-400 w-fit! flex gap-1 px-2' : 'bg-blue-500 hover:bg-blue-600 text-white w-fit! flex gap-1 px-2'"
                    tooltip="Mostrar/Ocultar Pendientes" tooltipPosition="top" @click="changeShowPendientes" activo="true">
                    <i :class="!showPendientes ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i> Ver {{
                        pendientes.length.toLocaleString('es-ES') }}
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


            <div class="h-[2px] w-full bg-gray-200 dark:bg-gray-800 my-3"></div>

            <div class="flex items-center my-2 px-5 gap-2">
                <i class="fa-solid fa-calendar-day text-blue-300"></i>
                <h2 class="text-xl font-semibold">Citas de Hoy</h2>
            </div>
        </div>

        <!-- Citas de Hoy -->
        <div class="grid gap-2 px-4"
            :class="{ 'xl:grid-cols-3 lg:grid-cols-2': varView.showEnFila || !varView.showCalendario, 'xl:grid-cols-2 lg:grid-cols-1': !varView.showEnFila }">
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
                v-for="cita in props.Propiedades.showTodas ? datosPaginados : citasFiltradas"
                :class="[{ 
                    'bg-red-50 dark:bg-red-900/40 border-l-4 border-red-200 hover:bg-red-200 hover:dark:bg-red-800': cita.estado === 'cancelada', 
                    'bg-gray-100 dark:bg-gray-900/40 border-l-4 border-gray-400 dark:border-yellow-900/40 text-gray-600 dark:text-gray-300 hover:bg-gray-200 hover:dark:bg-gray-700': vencida(cita) && cita.estado === 'Inactiva' }, props.Propiedades.tamaño]">

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
                                tooltip="Información" tooltipPosition="top" @click="showMotivoCancelacion(cita)">
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
</template>

<style>
/* .btnsPagina button {
    background: linear-gradient(to left, var(--color-default), var(--color-default-700));
} */
</style>