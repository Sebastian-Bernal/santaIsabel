<script setup>
import { ref, watch } from 'vue';
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

watch(() => props.modelValue, (nuevoValor) => {
    const propiedadFiltrar = props.Propiedades.opciones?.[0]?.value;
    
    if (!nuevoValor) {
        opcionesFiltradas.value = [];
        mostrarLista.value = false;
        return;
    }

    opcionesFiltradas.value = props.Propiedades.options?.value.filter(item =>
        item?.[propiedadFiltrar]?.toLowerCase().includes(nuevoValor.toLowerCase())
    ).slice(0,20);
});

function seleccionar(item) {
    props.Propiedades.seleccionarItem(item);
    mostrarLista.value = false;

    const primaryField = props.Propiedades.opciones[0]?.value;
    emit('update:modelValue', primaryField ? item[primaryField] : item);
};

function showLista() {
    mostrarLista.value = true;
};
</script>

<template>
    <div class="relative" :class="Propiedades.tamaño">
        <input :value="modelValue" 
        class="mt-1 text-gray-900 block px-3 py-2 border border-gray-300 dark:text-white dark:border-blue-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        :class="Propiedades.tamaño" type="text" autocomplete="off"
        :name="Propiedades.name" 
        :id="Propiedades.id" 
        :placeholder="Propiedades.placeholder"
        @input="$emit('update:modelValue', $event.target.value); showLista()"
        @click="Propiedades.events?.onClick"
        @change="Propiedades.events?.onChange"
        @blur="Propiedades.events?.onBlur"
        @keyup.enter="Propiedades.events?.onKeyUp" />

        <ul v-show="mostrarLista && opcionesFiltradas?.length"
            class="autocomplete-list absolute! top-full left-0 right-0 max-h-[200px] overflow-y-auto scrollForm bg-white dark:bg-gray-700 text-black dark:text-gray-50 border border-[#d0d7de] dark:border-gray-600 z-9 p-0 mt-1">
            <li v-for="opcion in opcionesFiltradas" :key="opcion.documento"
                class="px-3 py-2 hover:bg-blue-100 dark:hover:bg-gray-500 cursor-pointer" @mousedown.prevent="seleccionar(opcion)">
                <div v-for="campo in Propiedades.opciones" :key="campo.value">
                    <strong v-if="!campo.text" class="text-base">{{ opcion[campo.value] }}</strong>
                    <div v-else class="text-sm">
                        <strong>{{ campo.text }}:</strong> {{ opcion[campo.value] }}
                    </div>
                </div>

            </li>
        </ul>
    </div>
</template>