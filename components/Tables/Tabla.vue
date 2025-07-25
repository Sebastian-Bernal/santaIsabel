<script setup>
// importando los reursos
import { defineProps, computed, ref, watch } from 'vue';
import BotonAccion from './BotonAccion.vue';
import InputIcon from '../Inputs/InputIcon.vue';
import Button from '../Buttons/Button.vue'

import { usePaginacion } from '../../composables/Tabla/usePaginacion.js'
import { useColumnasResponsivas } from '../../composables/Tabla/useTablasResponsive';
import { useOrdenamiento } from '../../composables/Tabla/useDatosOrdenadosTabla';

// 
const btnAcciones = ref(null)

// funciones
const props = defineProps({
    columnas: {
        type: [Object, String],
        required: true,
        default: ''
    },
    acciones: {
        type: [Object, String],
        default: ''
    },
    datos: {
        type: [Object],
        required: true,
        dafault: []
    },
    headerTabla: {
        type: [Object],
    }
});


// tamaño de pantalla
const {
    columnasVisibles,
    columnasSobrantes,
    collapse,
    activarCollapse,
    screenWidth,
} = useColumnasResponsivas(ref(props.columnas));


// Acomodar datos de menor a mayor segun columna
const {
    busqueda,
    sortedItems,
    datosOrdenados
} = useOrdenamiento(computed(() => props.datos.content));


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

// Tamaño numero de columnas
const estiloColumnas = computed(() => {
    if (!columnasVisibles.value || columnasVisibles.value.length === 0) return {};

    const tamaños = columnasVisibles.value
        .map(col => col.tamaño && !isNaN(col.tamaño) ? `${col.tamaño}px` : '80px')
        .join(' ');

    return {
        gridTemplateColumns: `${tamaños}${props.acciones.botones ? ' 100px' : ''}`
    };
});

</script>

<template>
    <div class="h-[90%]">
        <!-- Header -->
        <div class="flex w-[100%] justify-between items-center md:flex-row flex-col gap-3">
            <div>
                <h1 class="font-bold text-2xl tituloTabla text-gray-800">
                    {{ props.headerTabla.titulo }}
                </h1>
                <p>{{ props.headerTabla.descripcion }}</p>
            </div>
            <div class="flex gap-3 md:w-[45%] justify-end">
                <InputIcon class="w-3/4" placeholder="Buscar por datos..." icon="fa-search" v-model="busqueda" />

                <client-only>
                    <download-excel class="flex gap-1 items-center" :data="props.datos.content"
                        :name="props.headerTabla.titulo" type="xls">
                        <Button color="bg-green-500">
                            <i class="fa-solid fa-file-excel"></i>
                        </Button>
                        <h4>Exportar</h4>
                    </download-excel>
                </client-only>

                <nuxt-link v-if="props.headerTabla.accionAgregar" @click="props.headerTabla.accionAgregar" class="flex gap-1 items-center">
                    <Button color="bg-blue-500">
                        <i class="fa-solid fa-plus"></i>
                    </Button>
                    <h4>Agregar</h4>
                </nuxt-link>
            </div>
        </div>

        <!-- Tabla -->
        <div class="mt-[20px] h-[80%] overflow-y-scroll containerTable shadow bg-white rounded-b-xl">
            <div class="w-full">

                <!-- Header titulos de props Columnas -->
                <div class="sticky top-0 z-1 grid py-4 px-2 justify-between text-xs font-bold rounded-t-xl text-center text-white"
                    :class="headerTabla.color" :style="estiloColumnas">
                    <h2 v-for="col in columnasVisibles" :key="col.titulo"
                        :style="{ width: `${col.tamaño}px`, minWidth: '60px' }">
                        {{ col.value }}
                        <i v-if="col.ordenar" @click="sortedItems(col.titulo)" class="fa-solid fa-angle-down"></i>
                    </h2>
                    <h2 v-if="acciones.botones" :class="acciones.class">Acciones</h2>
                </div>

                <hr class="horizontal">

                <!-- Body tabla -->
                <div v-for="(fila, id) in datosPaginados" class="bodyTable justify-between grid p-2 text-center"
                    :style="estiloColumnas">

                    <div v-for="(col, key) in columnasVisibles" :key="key" class="relative"
                        :style="{ width: `${col.tamaño}px`, minWidth: '60px' }">
                        <div class="w-[10px] h-[10px] rounded-full absolute left-[-10px] top-2"
                            :class="{ 'bg-red-500': fila[col.titulo] === 'Cambios criticos', 'bg-orange-500': fila[col.titulo] === 'Recomendaciones Adicionales', 'bg-green-500': fila[col.titulo] === 'Estado clinico sin cambios' }">
                        </div>
                        <p class="text-black truncate rounded-2xl">{{ fila[col.titulo] }}</p>
                    </div>

                    <!-- Acciones -->
                    <div v-if="acciones.botones"
                        class="flex items-center justify-center accionesTabla text-center gap-2"
                        :class="acciones.class">
                        <!-- Acciones por props -->
                        <BotonAccion v-if="!collapse" v-for="action in acciones.icons" :key="action" 
                        :tipo="typeof action.icon === 'function' ? action.icon(fila) : action.icon"
                            @click="action.action(fila)" />

                        <!-- Tablas ocultas responsive  -->
                        <button @click="activarCollapse(id)" v-if="collapse"
                            class="flex items-center justify-center bg-gray-200 w-[24px] h-[24px] text-white rounded-full cursor-pointer hover:opacity-75">
                            <i class="fa-solid fa-plus text-gray-600"></i>
                        </button>
                        <!-- Acciones porp props Responsive -->
                        <button @click="mostrarAcciones(id)" v-if="collapse"
                            class="flex items-center justify-center bg-gray-200 w-[24px] h-[24px] text-white rounded-full cursor-pointer hover:opacity-75">
                            <i class="fa-solid fa-ellipsis-vertical text-gray-600"></i>

                            <div v-if="btnAcciones === id" class="acciones" :id="id">
                                <BotonAccion v-for="action in acciones.icons" :key="action" 
                                :tipo="typeof action.icon === 'function' ? action.icon(fila) : action.icon" />
                            </div>
                        </button>
                    </div>

                    <!-- collapse -->
                    <div class="collapse-text col-span-full" :id="id">
                        <div class="w-full grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2">
                            <h2 v-for="(col, key) in columnasSobrantes" class="flex-wrap truncate">
                                <p
                                    class="text-[var(--color-primary)] text-xs font-bold border-t-gray-200 mb-2 truncate">
                                    {{ col.titulo }}</p>
                                {{ fila[col.titulo] }}
                            </h2>
                        </div>
                    </div>
                </div>

                <div>
                    <p v-if="datosPaginados.length === 0" class="text-gray-500 text-center mt-10">No se encontraron
                        resultados.</p>
                </div>

            </div>
        </div>

        <!-- Paginador -->
        <div class="mt-[10px] flex justify-between items-center h-[30px] px-10">
            <p class="text-sm text-gray-500">
                Registros {{ ultimaPagina - itemsPorPagina + 1 }} al {{ ultimaPagina }}</p>

            <div class="btnsPagina flex items-center gap-3">
                <button v-if="paginaActual > 1"
                    class="text-l p-2 text-white w-[30px] h-[30px] flex justify-center items-center rounded-full cursor-pointer"
                    @click="paginaAnterior()">
                    <i class="fa-solid fa-angle-left"></i>
                </button>
                <div class="flex gap-2 pagina">
                    <h2 v-if="paginaActual > 1" @click="irAPagina(paginaActual - 1)"
                        class="text-gray-600 hover:bg-[var(--color-gray-200)] cursor-pointer flex justify-center items-center px-2 w-[30px] h-[30px] rounded-full">
                        {{ paginaActual - 1 }}</h2>
                    <h2
                        class="bg-[var(--color-gray-200)] text-gray-600 flex justify-center items-center px-2 w-[30px] h-[30px] rounded-full">
                        {{ paginaActual }}</h2>
                    <h2 v-if="paginaActual < totalPaginas" @click="irAPagina(paginaActual + 1)"
                        class="text-gray-600 hover:bg-[var(--color-gray-200)] cursor-pointer flex justify-center items-center px-2 w-[30px] h-[30px] rounded-full">
                        {{ paginaActual + 1 }}</h2>
                </div>
                <button v-if="paginaActual != totalPaginas"
                    class="text-l p-2 text-white w-[30px] h-[30px] flex justify-center items-center rounded-full cursor-pointer"
                    @click="siguientePagina()">
                    <i class="fa-solid fa-angle-right"></i>
                </button>
            </div>

            <div class="flex gap-2 items-center">
                <p class="text-sm text-gray-500">Número de registros</p>
                <select name="numRegistros" class="text-black bg-gray-200 rounded-xl p-1"
                    @change="cambiarItemsPorPagina($event.target.value)">
                    <option value="5">5</option>
                    <option value="10" selected>10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>
    </div>
</template>



<style scoped>
.containerTable::-webkit-scrollbar {
    display: none;
}

.bodyTable:nth-child(even) {
    background-color: var(--color-primary-claro);
}

.bodyTable:hover:nth-child(even) {
    background-color: var(--color-gris);
}

.bodyTable:hover {
    background-color: var(--color-gris);
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
    position: relative;
    left: -10px;
    top: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    padding: 5px;
}

.acciones button {
    width: 60px;
    height: 25px;
    border-radius: 0;
}

.acciones button:hover {
    opacity: 1;
}

/* Paginador css */
.btnsPagina button {
    background: linear-gradient(to left, var(--color-default), var(--color-default-oscuro));
}

.horizontal {
    color: var(--color-gris);
}
</style>