<script setup>
// importando los reursos
import { defineProps, computed, ref, watch } from 'vue';
import BotonAccion from './BotonAccion.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import DatosExcel from '~/components/organism/Forms/DatosExcel.vue';

import { usePaginacion } from '~/composables/Tabla/usePaginacion.js'
import { useColumnasResponsivas } from '~/composables/Tabla/useTablasResponsive';
import { useOrdenamiento } from '~/composables/Tabla/useDatosOrdenadosTabla';

// Variables
const btnAcciones = ref(null)
const showFiltros = ref(false)
const varView = useVarView()
// funciones
const props = defineProps({
    Propiedades: {
        type: [Object, Array],
        requiered: true,
        default: {}
    }
});

// tamaño de pantalla
const {
    columnasVisibles,
    columnasSobrantes,
    collapse,
    activarCollapse,
    activeCollapse,
    idActivo,
    screenWidth,
} = useColumnasResponsivas(ref(props.Propiedades?.columnas), props.Propiedades.headerTabla?.espacioMargen);


// Acomodar datos de menor a mayor segun columna, filtros
const {
    busqueda,
    filtros,
    filtrosConOpciones,
    sortedItems,
    datosOrdenados,
    borrarFiltros
} = useOrdenamiento(props.Propiedades.datos.content || ref([]), props.Propiedades.headerTabla.filtros);


// Paginador
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


// Funciones
const mostrarAcciones = (id) => {
    btnAcciones.value = btnAcciones.value === id ? null : id;
};

// Al buscar cambia a primera pagina
watch(busqueda, (nuevoValor, anteriorValor) => {
    if (nuevoValor !== anteriorValor) {
        paginaActual.value = 1;
    }
});

watch(filtros, (nuevoValor, anteriorValor) => {
    paginaActual.value = 1;
}, { deep: true });

// Tamaño numero de columnas
const estiloColumnas = computed(() => {
    if (!columnasVisibles.value || columnasVisibles.value.length === 0) return {};

    const tamaños = columnasVisibles.value
        .map(col => col.tamaño && !isNaN(col.tamaño) ? 
            screenWidth.value > 748 ? `${col.tamaño}px` : '100px'
            : '80px')
        .join(' ');

    return {
        gridTemplateColumns: `${tamaños}${props.Propiedades.acciones.botones ? ' 100px' : ''}`
    };
});

// Tamaño tabla
const tablaAlto = computed(() => {
    const pixeles = (itemsPorPagina.value * 40) + 48
    return {
        height: `${pixeles}px`
    }
})
</script>

<template>
    <div class="h-[90%]">
        <!-- Header -->
        <div class="flex w-[100%] justify-between items-center md:flex-row flex-col gap-3">
            <div>
                <h1 class="font-bold md:text-2xl text-xl tituloTabla text-gray-800 dark:text-gray-200">
                    {{ props.Propiedades.headerTabla?.titulo }}
                </h1>
                <p>{{ props.Propiedades.headerTabla?.descripcion }}</p>
            </div>
            <div class="flex gap-3 md:w-[45%] w-full justify-end">

                <div v-if="Propiedades.headerTabla.filtros?.length > 0" class="flex items-center gap-1 cursor-pointer"
                    @click="showFiltros = !showFiltros">
                    <ButtonRounded color="bg-blue-700">
                        <i class="fa-solid fa-filter"></i>
                    </ButtonRounded>
                    <h4 class="md:block hidden">Filtrar Datos</h4>
                </div>

                <client-only v-if="Propiedades.headerTabla.excel">
                    <div class="flex relative dropdown cursor-pointer ">
                        <div class="flex gap-1 items-center">
                            <ButtonRounded color="bg-green-500">
                                <i class="fa-solid fa-file-excel"></i>
                            </ButtonRounded>
                            <h4 class="md:block hidden">Exportar</h4>
                        </div>
                        <div
                            class="configExcel flex flex-col absolute top-[100%] md:left-0 left-[-70%] bg-[var(--color-default-500)] text-gray-300 md:p-3 p-1 z-9 gap-4 items-center justify-center rounded-lg">

                            <download-excel class="flex gap-1 hover:text-white"
                                :data="Array.isArray(props.Propiedades?.datos?.content) ? unref(props.Propiedades.datos.content) : unref(props.Propiedades.datos.content)"
                                :name="props.Propiedades.headerTabla.titulo" type="xlsx">
                                <i class="fa-solid fa-download"></i>
                                <p class="text-xs">Descargar</p>
                            </download-excel>

                            <div class="flex gap-1 hover:text-white" @click="varView.showDatosExcel = true">
                                <i class="fa-solid fa-gear"></i>
                                <p class="text-xs">Configurar</p>
                            </div>

                        </div>
                    </div>
                </client-only>

                <nuxt-link v-if="props.Propiedades.headerTabla?.accionAgregar"
                    @click="props.Propiedades.headerTabla.accionAgregar" class="flex gap-1 items-center cursor-pointer">
                    <ButtonRounded color="bg-blue-500">
                        <i class="fa-solid fa-plus"></i>
                    </ButtonRounded>
                    <h4 class="md:block hidden">Agregar</h4>
                </nuxt-link>
            </div>
        </div>
        <!-- Filtos -->
        <div class="w-full mt-4 py-4 px-5 dark:bg-[rgba(0,0,0,0.1)] bg-gray-100 rounded-xl"
            v-if="Propiedades.headerTabla.bucador && showFiltros || Propiedades.headerTabla.filtros && showFiltros">
            <div class="flex justify-between items-center">
                <p class="text-sm text-gray-500 pb-1">Filtrar Datos de la tabla</p>
                <span v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '')" class="dark:text-gray-400 text-gray-600 cursor-pointer"
                    @click="borrarFiltros"> <i class="fa-solid fa-close"></i> Borrar filtros</span>
            </div>
            <div class="flex items-end justify-between gap-5 md:flex-row flex-col">
                <Input v-if="Propiedades.headerTabla.buscador" :Propiedades="{
                    placeholder: 'Buscar dato en la Tabla...',
                    icon: 'fa-solid fa-search',
                    modelValue: busqueda,
                    tamaño: 'md:w-2/5 w-full',
                    upperCase: true,
                    estilo: 'bg-white dark:bg-gray-900'
                }" v-model="busqueda" />

                <div class="md:w-3/4 w-full flex justify-end md:gap-5 gap-2 md:flex-row flex-col">
                    <Select v-for="(filtro, key) in filtrosConOpciones" :key="key" :Propiedades="{
                        placeholder: filtro.placeholder,
                        label: filtro.placeholder,
                        modelValue: busqueda,
                        tamaño: 'md:w-1/4 w-full',
                        estilo: 'bg-white dark:bg-gray-900',
                        options: [{ text: 'Todos', value: '' }, ...filtro.datos,],
                    }" v-model="filtros[filtro.columna]" />
                </div>
            </div>
        </div>

        <!-- Tabla -->
        <div class="mt-[20px] h-[80%] overflow-y-scroll containerTable shadow-lg dark:shadow-[0_2px_4px_rgba(255,255,255,0.1)] bg-white dark:bg-gray-900 rounded-b-xl">
            <div class="w-full" :style="tablaAlto">

                <!-- Header titulos de props Columnas -->
                <div class="sticky top-0 z-1 grid py-4 px-2 justify-between text-xs font-bold rounded-t-xl text-center text-white"
                    :class="Propiedades.headerTabla?.color" :style="estiloColumnas">
                    <h2 v-for="col in columnasVisibles" :key="col.titulo"
                        :style="{ width: `${col.tamaño}px`, minWidth: '60px' }">
                        {{ col.value }}
                        <i v-if="col.ordenar" @click="sortedItems(col.titulo)"
                            class="fa-solid fa-sort cursor-pointer"></i>
                    </h2>
                    <h2 v-if="Propiedades.acciones.botones" :class="Propiedades.acciones.class">Acciones</h2>
                </div>

                <!-- Body tabla -->
                <div v-for="(fila, id) in datosPaginados"
                    class="bodyTable justify-between grid p-2 text-center hover:bg-[var(--color-default-claro)] odd:bg-[var(--color-default-claro-100)] odd:hover:bg-[var(--color-default-claro)] dark:odd:bg-gray-800 dark:hover:bg-gray-700 dark:odd:hover:bg-gray-700"
                    :style="estiloColumnas">

                    <div v-for="(col, key) in columnasVisibles" :key="key"
                        :style="{ width: `${col.tamaño}px`, minWidth: '60px' }">
                        <p class="text-black dark:text-white truncate rounded-2xl">{{ fila[col.titulo] }}</p>
                    </div>

                    <!-- Acciones -->
                    <div v-if="Propiedades.acciones.botones"
                        class="flex items-center justify-center accionesTabla text-center gap-2"
                        :class="Propiedades.acciones.class">
                        <!-- Acciones por props -->
                        <BotonAccion v-if="!collapse && Propiedades.acciones.icons.length < 4 || Propiedades.acciones.icons.length < 2 "
                            v-for="action in Propiedades.acciones.icons" :key="action"
                            :tipo="typeof action.icon === 'function' ? action.icon(fila) : action.icon"
                            @click="action.action(fila)" />

                        <!-- Tablas ocultas responsive  -->
                        <button @click="activarCollapse(id, Propiedades.headerTabla.titulo)" v-if="collapse"
                            class="flex items-center justify-center bg-gray-200 w-[24px] h-[24px] text-white rounded-full transition-all duration-300 cursor-pointer active:scale-95 hover:opacity-75">
                            <i v-if="!activeCollapse || id !== idActivo" class="fa-solid fa-angle-down text-gray-600"></i>
                            <i v-if="activeCollapse && id === idActivo" class="fa-solid fa-angle-up text-gray-600"></i>
                        </button>
                        <!-- Acciones porp props Responsive -->
                        <div class="relative inline-block text-left">
                            <button @click="mostrarAcciones(id)"
                                v-if="collapse && Propiedades.acciones.icons.length > 1 || Propiedades.acciones.icons.length > 3"
                                class="btn-accionesOcultas flex items-center justify-center bg-gray-200 w-[24px] h-[24px] text-white rounded-full transition-all duration-300 cursor-pointer active:scale-95 hover:bg-gray-300">
                                <i class="fa-solid fa-ellipsis-vertical text-gray-600"></i>
                            </button>

                            <!-- Dropdown -->
                            <div v-if="btnAcciones === id"
                                class="acciones absolute right-0 mt-2 w-16 bg-white dark:bg-gray-800 shadow-lg rounded-md z-5"
                                :id="id">
                                <BotonAccion v-for="action in Propiedades.acciones.icons" :key="action"
                                    :tipo="typeof action.icon === 'function' ? action.icon(fila) : action.icon"
                                    @click="() => { action.action(fila); mostrarAcciones(id)}"
                                    class="w-full text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md">
                                </BotonAccion>
                            </div>
                        </div>

                    </div>

                    <!-- collapse -->
                    <div class="collapse-text col-span-full" :id="`${id}-${Propiedades.headerTabla.titulo}`">
                        <div class="w-full grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2">
                            <h2 v-for="(col, key) in columnasSobrantes" class="flex-wrap truncate">
                                <p
                                    class="text-[var(--color-default-700)] dark:text-[var(--color-default-claro)] text-xs font-bold border-t-gray-200 mb-2 truncate">
                                    {{ col.titulo }}</p>
                                {{ fila[col.titulo] }}
                            </h2>
                        </div>
                    </div>
                </div>

                <!-- filas vacías para rellenar -->
                <div v-if="datosPaginados?.length > 0" v-for="n in (itemsPorPagina - datosPaginados.length)" :key="`empty-${n}`"
                    class="bodyTable justify-between grid p-2 text-center hover:bg-[var(--color-default-claro)] odd:bg-[var(--color-default-claro-100)] odd:hover:bg-[var(--color-default-claro)] dark:odd:bg-gray-800 dark:hover:bg-gray-700 dark:odd:hover:bg-gray-700"
                    :style="estiloColumnas">

                    <div v-for="(col, key) in columnasVisibles" :key="key"
                        :style="{ width: `${col.tamaño}px`, minWidth: '60px' }">
                        <p class="text-transparent select-none">.</p>
                    </div>
                </div>


                <div v-if="datosPaginados?.length === 0">
                    <p class="text-gray-500 text-center my-10">No se encontraron
                        resultados. <i class="fa-solid fa-search-minus"></i></p>
                </div>

            </div>
        </div>

        <!-- Paginador -->
        <div class="mt-[10px] flex justify-between items-center h-[30px] md:px-10">
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
                        class="text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer flex justify-center items-center px-2 w-[30px] h-[30px] rounded-full">
                        {{ paginaActual - 1 }}</h2>
                    <h2
                        class="bg-gray-200 dark:bg-gray-800 dark:text-gray-300 text-gray-600 flex justify-center items-center px-2 w-[30px] h-[30px] rounded-full">
                        {{ paginaActual }}</h2>
                    <h2 v-if="paginaActual < totalPaginas" @click="irAPagina(paginaActual + 1)"
                        class="text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer flex justify-center items-center px-2 w-[30px] h-[30px] rounded-full">
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
                <p class="text-sm text-gray-500 md:hidden block">N. registros</p>
                <select name="numRegistros" class="text-black bg-gray-100 rounded-xl p-1 cursor-pointer"
                    @change="cambiarItemsPorPagina($event.target.value)">
                    <option value="5">5</option>
                    <option value="10" selected>10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>
    </div>
    <DatosExcel v-if="varView.showDatosExcel" :datos="props.Propiedades.datos.content"
        :tabla="props.Propiedades.headerTabla.titulo" />
</template>



<style scoped>
.configExcel {
    opacity: 0;
    pointer-events: none;
    transform: translateX(0) translateY(-10%);
    transition: all 0.3s ease;
}

.dropdown:hover .configExcel {
    opacity: 1;
    pointer-events: all;
    transform: translateX(0) translateY(0);
}

.containerTable::-webkit-scrollbar {
    display: none;
}


.btnActions {
    border: none;
    color: white;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    padding: .40rem;
    margin: 0;
    border-radius: 50%;
}

.collapse-text {
    display: none;
    margin-top: 20px;
    pointer-events: none;
    justify-content: space-evenly;
}

.collapseActive {
    display: flex;
    pointer-events: all;
}

.acciones {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.btn-accionesOcultas {
    transition: background-color 0.2s ease;
}

.btn-accionesOcultas:hover {
    background-color: #d1d5db;
    /* gris más oscuro */
}

/* Paginador css */
.btnsPagina button {
    background: linear-gradient(to left, var(--color-default), var(--color-default-700));
}
</style>