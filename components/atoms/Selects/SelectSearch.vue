<script setup>
import { ref, watch, unref, } from 'vue';
// Input con datos seleccionables
// Props modelvalue, options = data. ej: Pacientes, opciones = valores a comparar: ej Name, seleccionarItem: funcion al seleccionar item

const props = defineProps({
    modelValue: {
        default: ''
    },
    Propiedades: {
        default: {}
    }
});

const emit = defineEmits(['update:modelValue']);

const mostrarLista = ref(false);
const opcionesFiltradas = ref([]);
const errorMensaje = ref();
const desplegarArriba = ref(false);
const opcionActiva = ref(-1);

watch(() => props.modelValue, (nuevoValor) => {
    opcionActiva.value = -1;
    const propiedadFiltrar1 = unref(props.Propiedades.opciones?.[0]?.value ?? '');
    const propiedadFiltrar2 = unref(props.Propiedades.opciones?.[1]?.value ?? '');
    const opciones = unref(props.Propiedades?.options?.value ?? props.Propiedades?.options ?? []);

    if (!nuevoValor || nuevoValor.length < 2) {
        opcionesFiltradas.value = [];
        mostrarLista.value = false;
        return;
    }

    opcionesFiltradas.value = Array.isArray(opciones) ? opciones.filter(item => {
        const val1 = String(item?.[propiedadFiltrar1] ?? '').toLowerCase();
        const val2 = String(item?.[propiedadFiltrar2] ?? '').toLowerCase();
        return val1.includes(nuevoValor.toLowerCase()) || val2.includes(nuevoValor.toLowerCase());
    }).slice(0, 20) : [];

    const filtradas = opcionesFiltradas.value;
    const coincidenciaExacta = filtradas.find(item => {
        const val1 = String(item?.[propiedadFiltrar1] ?? '').toLowerCase();
        const val2 = String(item?.[propiedadFiltrar2] ?? '').toLowerCase();
        return val1 === nuevoValor.toLowerCase() || val2 === nuevoValor.toLowerCase();
    });

    mostrarLista.value = opcionesFiltradas.value.length > 0 && !coincidenciaExacta;

    // Mostrar error si no hay coincidencia exacta
    errorMensaje.value = coincidenciaExacta || opcionesFiltradas.value.length > 0
        ? ''
        : 'No se encontró ninguna coincidencia';
});

function coincidencia(event) {
    const nuevoValor = event.target.value;
    const propiedadFiltrar1 = unref(props.Propiedades.opciones?.[0]?.value ?? '');
    const propiedadFiltrar2 = unref(props.Propiedades.opciones?.[1]?.value ?? '');

    const coincidenciaExacta = opcionesFiltradas.value.find(item => {
        const val1 = item?.[propiedadFiltrar1]?.toLowerCase() ?? '';
        const val2 = item?.[propiedadFiltrar2]?.toLowerCase() ?? '';
        return val1 === nuevoValor.toLowerCase() || val2 === nuevoValor.toLowerCase();
    });

    if (coincidenciaExacta) {
        seleccionar(coincidenciaExacta)
    }
}

function seleccionar(item) {
    props.Propiedades.seleccionarItem(item);
    mostrarLista.value = false;

    const primaryField = props.Propiedades.opciones[0]?.value;
    emit('update:modelValue', primaryField ? item[primaryField] : item);
};

function handleInput(event) {
    let value = event.target.value;

    // Aplica transformación solo si se especifica
    if (props.Propiedades.upperCase === true) {
        value = value.toUpperCase();
    } else if (props.Propiedades.lowerCase === true) {
        value = value.toLowerCase();
    }

    // posición del input en la pantalla
    const rect = event.target.getBoundingClientRect();
    const mitadPantalla = window.innerHeight / 2;

    // si el input está debajo de la mitad, desplegamos hacia arriba
    desplegarArriba.value = rect.top > mitadPantalla;

    // Emitimos el valor transformado (o sin transformar)
    emit('update:modelValue', value);
}

function handleBlur(event) {
    // Esperar a que se ejecute el mousedown del ul
    setTimeout(() => {
        if (!mostrarLista.value) {
            coincidencia(event);
        }
    }, 150);
    mostrarLista.value = false
}

function manejarTeclas(event) {
    if (!mostrarLista.value || !opcionesFiltradas.value.length) return;

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            opcionActiva.value =
                opcionActiva.value < opcionesFiltradas.value.length - 1
                    ? opcionActiva.value + 1
                    : 0;
            break;

        case 'ArrowUp':
            event.preventDefault();
            opcionActiva.value =
                opcionActiva.value > 0
                    ? opcionActiva.value - 1
                    : opcionesFiltradas.value.length - 1;
            break;

        case 'Enter':
            event.preventDefault();
            if (opcionActiva.value >= 0) {
                seleccionar(opcionesFiltradas.value[opcionActiva.value]);
            }
            break;

        case 'Escape':
            mostrarLista.value = false;
            opcionActiva.value = -1;
            break;
    }
}

</script>

<template>
    <div class="relative" :class="Propiedades.tamaño">
        <input :value="modelValue"
            class="z-100 mt-1 h-[35px] text-gray-900 block px-3 py-2 pr-8 border border-gray-300 dark:text-white dark:border-blue-900 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            :class="Propiedades.tamaño" type="text" autocomplete="off" :name="Propiedades.name" :id="Propiedades.id"
            :placeholder="Propiedades.placeholder" :disabled="Propiedades.disabled" @input="handleInput($event)"
            @click="Propiedades.events?.onClick" @change="Propiedades.events?.onChange?.($event)" @blur="handleBlur"
            @keyup.enter="Propiedades.events?.onKeyUp" @keydown="manejarTeclas" />


        <ul v-show="mostrarLista && opcionesFiltradas?.length" :class="[
            'autocomplete-list absolute left-0 right-0 max-h-[200px] overflow-y-auto scrollForm bg-white dark:bg-gray-700 text-black dark:text-gray-50 border border-[#d0d7de] dark:border-gray-600 z-999999 p-0',
            desplegarArriba ? 'bottom-full mb-1 rounded-t-lg' : 'top-full mt-1 rounded-b-lg'
        ]">
            <li v-for="(opcion, index) in opcionesFiltradas" :key="opcion.documento" 
            :class="[
                'px-3 py-2 cursor-pointer',
                index === opcionActiva
                    ? 'bg-blue-200 dark:bg-gray-600'
                    : 'hover:bg-blue-100 dark:hover:bg-gray-500'
            ]" 
            @mousedown.prevent="seleccionar(opcion)">
                <div v-for="campo in Propiedades.opciones" :key="campo.value">
                    <strong v-if="!campo.text" class="text-base">{{ opcion[campo.value] }}</strong>
                    <div v-else class="text-sm">
                        <strong>{{ campo.text }}:</strong> {{ opcion[campo.value] }}
                    </div>
                </div>
            </li>
        </ul>
        <div v-if="!Propiedades.disabled" class="absolute top-2 right-3">
            <i class="fa-solid fa-search text-sm text-blue-600 transition-all duration-300 cursor-pointer active:scale-85"></i>
        </div>

        <p class="text-xs text-red-400">{{ errorMensaje }}</p>
    </div>
</template>