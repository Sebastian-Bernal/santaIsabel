<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  id: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Seleccione una opción'
  },
  tamaño: {
    type: [String, Object, Array],
    default: 'w-full'
  }
});

const emit = defineEmits(['update:modelValue']);

const showOptions = ref(false);

function mostrarOptions() {
  showOptions.value = !showOptions.value;
}

function añadirDato(dato) {
  const permisos = [...props.modelValue];
  const index = permisos.indexOf(dato);

  if (index !== -1) {
    permisos.splice(index, 1);
  } else {
    permisos.push(dato);
  }

  emit('update:modelValue', permisos);
}

function seleccionarTodos() {
  const todosSeleccionados = props.options.length === props.modelValue.length &&
    props.options.every(valor => props.modelValue.includes(valor));

  emit('update:modelValue', todosSeleccionados ? [] : [...props.options]);
}
</script>

<template>
  <div class="relative" :class="tamaño">
    <select
      :name="name"
      :id="id"
      :class="tamaño"
      class="mt-1 text-gray-900 block px-3 py-2 border border-gray-300 dark:text-white dark:border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      @click="mostrarOptions"
    >
      <option disabled selected hidden>{{ placeholder }}</option>
    </select>

    <ul
      v-show="showOptions"
      class="autocomplete-list absolute! top-full left-0 right-0 max-h-[180px] overflow-y-auto scrollForm bg-white border border-[#d0d7de] rounded-lg z-9 px-3 mt-1"
    >
      <div class="flex gap-3 cursor-pointer" @click="seleccionarTodos">
        <label class="font-semibold w-full px-3 py-2 hover:bg-blue-100">Seleccionar Todos</label>
      </div>
      <li
        v-for="dato in options"
        :key="dato"
        class="flex gap-3 items-center cursor-pointer"
        @click="añadirDato(dato)"
      >
        <input
          type="checkbox"
          :checked="modelValue.includes(dato)"
          :value="dato"
          :id="dato"
          readonly
        />
        <label>{{ dato }}</label>
      </li>
    </ul>
  </div>
</template>