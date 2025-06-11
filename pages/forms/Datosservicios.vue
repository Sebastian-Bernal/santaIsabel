<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Forms/Input.vue';
import { ref } from 'vue';
definePageMeta({
    layout: 'authentication'
});

const {formData, traerDatos, guardarDatos} = useFormData();

const nuevoServicio = ref({
    descripcion: '',
    cantidad: '',
    mes: ''
});

const añadirServicio = () => {
    const servicio = nuevoServicio.value;
    if (!servicio.descripcion) {
        console.log('Por favor, complete el servicio actual antes de añadir uno nuevo.');
        return;
    }
    formData.Plan_manejo_procedimientos.push({ ...servicio });
    // Reiniciar el objeto nuevoServicio
    nuevoServicio.value = {
        descripcion: '',
        cantidad: '',
        mes: ''
    };
};

// Guardar los datos en localStorage

watch(formData, (newValue) => {
    guardarDatos(newValue)
}, { deep: true });

onMounted(() => {
    traerDatos();
});

</script>

<template>
    <Formulario :datos="{
        titulo: 'Datos del servicio',
        botones: [
            { texto: 'Atras', ruta: '/forms/DatosConsulta', color: 'bg-gray-500' },
        ]
    }">
        <div class="md:w-4/5 w-full">
            <label class="block text-sm font-medium text-gray-700">Plan de manejo</label>
            <div class="flex items-center gap-3">
                <Input v-model="nuevoServicio.descripcion" type="text" id="descripcion" name="descripcion"
                    placeholder="Descripcion" tamaño="w-full" />
            </div>
        </div>

        <div class="md:w-4/5 w-full">
            <div class="flex items-center gap-3">

                <Input v-model="nuevoServicio.cantidad" type="text" id="cantidad" name="cantidad" placeholder="Cantidad"
                    tamaño="w-1/2" />
                <Input v-model="nuevoServicio.mes" type="text" id="mes" name="mes" placeholder="Mes" tamaño="w-1/2" />
            </div>
        </div>

        <div class="md:w-4/5 w-full flex justify-end">
            <button type="button" @click="añadirServicio"
                class="bg-gray-500 text-white text-xs font-semibold mt-2 py-2 px-3 rounded cursor-pointer hover:opacity-75">
                Añadir servicio
            </button>
        </div>

        <div v-if="formData.Plan_manejo_procedimientos ? formData.Plan_manejo_procedimientos.length > 0 : false"
            class="md:w-4/5 w-full max-h-[300px] overflow-y-auto border border-gray-300 rounded-md p-2">
            <div class="grid grid-cols-3 text-center text-xs justify-between items-center gap-3">
                <h4>Descripcion</h4>
                <h4>Cantidad</h4>
                <h4>Mes</h4>
            </div>
            <div v-for="(servicio, index) in formData.Plan_manejo_procedimientos" :key="index"
                class="grid grid-cols-3 text-center justify-between items-center gap-3 mt-3">
                <p tamaño="text-xs">{{ servicio.descripcion }}</p>
                <p tamaño="text-xs">{{ servicio.cantidad }}</p>
                <p tamaño="text-xs">{{ servicio.mes }}</p>
            </div>
        </div>

    </Formulario>
</template>