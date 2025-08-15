<script setup>
import { ref, watch } from 'vue';
// Input con datos seleccionables
// Props modelvalue, options = data. ej: Pacientes, opciones = valores a comparar: ej Name, seleccionarItem: funcion al seleccionar item

const props = defineProps({
    // modelValue: {
    //     type: String,
    //     default: ''
    // },
    // options: {
    //     type: [Array, Object],
    //     required: true
    // },
    // placeholder: {
    //     type: String,
    //     default: 'Buscar...'
    // },
    // name: {
    //     type: String,
    //     required: true
    // },
    // id: {
    //     type: String,
    //     default: ''
    // },
    // tamaño: {
    //     type: [String, Object, Array],
    //     default: 'w-full'
    // },
    // seleccionarItem: {
    //     type: Function,
    //     required: true
    // },
    // opciones: {
    //     type: Array
    // },
    Propiedades: {
        default: {}
    }
});
console.log(props.Propiedades)
const emit = defineEmits(['update:modelValue']);

const mostrarLista = ref(false);
const opcionesFiltradas = ref([]);

watch(() => props.Propiedades.modelValue, (nuevoValor) => {
    const propiedadFiltrar = props.Propiedades.opciones?.[0]?.value;

    if (!nuevoValor) {
        opcionesFiltradas.value = [];
        mostrarLista.value = false;
        return;
    }

    opcionesFiltradas.value = props.Propiedades.options.filter(item =>
        item?.[propiedadFiltrar]?.toLowerCase().includes(nuevoValor.toLowerCase())
    ).slice(0,20);
});

function seleccionar(paciente) {
    props.Propiedades.seleccionarItem(paciente);
    mostrarLista.value = false;

    emit('update:modelValue', paciente.name);
};

function showLista() {
    mostrarLista.value = true;
};
</script>

<template>
    <div class="relative" :class="Propiedades.tamaño">
        <input :value="Propiedades.modelValue" :name="Propiedades.name" :id="id" :class="Propiedades.tamaño" type="text" autocomplete="off"
            :placeholder="placeholder"
            class="mt-1 text-gray-900 block px-3 py-2 border border-gray-300 dark:text-white dark:border-blue-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            @input="$emit('update:modelValue', $event.target.value); showLista()" />

        <ul v-show="mostrarLista && opcionesFiltradas.length"
            class="autocomplete-list absolute! top-full left-0 right-0 max-h-[200px] overflow-y-auto scrollForm bg-white border border-[#d0d7de] rounded-lg z-9 p-0 mt-1">
            <li v-for="opcion in opcionesFiltradas" :key="opcion.documento"
                class="px-3 py-2 hover:bg-blue-100 cursor-pointer" @mousedown.prevent="seleccionar(opcion)">
                <div v-for="campo in opciones" :key="campo.value">
                    <strong v-if="!campo.text" class="text-base">{{ opcion[campo.value] }}</strong>
                    <div v-else class="text-sm">
                        <strong>{{ campo.text }}:</strong> {{ opcion[campo.value] }}
                    </div>
                </div>

            </li>
        </ul>
    </div>
</template>