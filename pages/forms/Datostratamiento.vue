<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Forms/Input.vue';
import { ref } from 'vue';

definePageMeta({
    layout: 'authentication'
});

const formData = ref({
    Plan_manejo_medicamentos: [],
});

const nuevoMedicamento = ref({
    medicamento: '',
    presentacion: '',
    concentracion: '',
    cantidad: '',
    dosis: ''
});

const añadirMedicamento = () => {
    const medicamento = nuevoMedicamento.value;
    if (!medicamento.medicamento) {
        console.log('Por favor, complete el medicamento actual antes de añadir uno nuevo.');
        return;
    }

    formData.value.Plan_manejo_medicamentos.push({ ...medicamento });
    nuevoMedicamento.value = {
        medicamento: '',
        presentacion: '',
        concentracion: '',
        cantidad: '',
        dosis: ''
    };
};

// Guardar los datos en localStorage

watch(formData, (newValue) => {
    localStorage.setItem('formData', JSON.stringify(newValue));
}, { deep: true });

onMounted(() => {
    traerDatos();
});

const traerDatos = () => {
    const datosGuardados = localStorage.getItem('formData');
    if (datosGuardados) {
        formData.value = JSON.parse(datosGuardados);
    } else {
        console.log('No hay datos guardados en localStorage.');
    }
};

</script>

<template>
    <Formulario :datos="{
            titulo: 'Medicamentos',
            botones: [
                { texto: 'Atras', ruta: '/forms/DatosConsulta', color: 'bg-gray-500' },
                // { texto: 'Registrar', ruta: '/forms/DatosConsulta', color: 'bg-[var(--color-primary)]' }
            ]
        }">

        <div class="md:w-4/5 w-full">
            <label class="block text-sm font-medium text-gray-700">Plan de manejo</label>
            <div class="flex items-center gap-3 md:flex-row flex-col">
                <Input v-model="nuevoMedicamento.medicamento" type="text" id="medicamento" name="medicamento"
                    placeholder="Nombre del medicamento" tamaño="md:w-3/4 w-full" />
                <Input v-model="nuevoMedicamento.presentacion" type="text" id="presentacion" name="presentacion"
                    placeholder="Presentacion" tamaño="md:w-1/4 w-full" />
            </div>
        </div>

        <div class="md:w-4/5 w-full">
            <div class="flex items-center gap-3 md:flex-row flex-col">
                <Input v-model="nuevoMedicamento.concentracion" type="text" id="concentracion" name="concentracion"
                    placeholder="Concentracion" tamaño="md:w-1/3 w-full" />

                <Input v-model="nuevoMedicamento.cantidad" type="text" id="cantidad" name="cantidad"
                    placeholder="Cantidad" tamaño="md:w-1/3 w-full" />

                <Input v-model="nuevoMedicamento.dosis" type="text" id="dosis" name="dosis" placeholder="Dosis"
                    tamaño="md:w-1/3 w-full" />
            </div>
        </div>

        <div class="md:w-4/5 w-full flex justify-end">
            <button type="button" @click="añadirMedicamento()"
                class="bg-gray-500 text-white text-xs font-semibold mt-2 py-2 px-3 rounded cursor-pointer hover:opacity-75">
                Añadir medicamento
            </button>
        </div>

        <div v-if="formData.Plan_manejo_medicamentos.length > 0" class="md:w-4/5 w-full border border-gray-300 rounded-md p-2">

            <div class="grid grid-cols-5 text-center text-xs justify-between items-center gap-3 mb-2">
                <h4>Medicamento</h4>
                <h4>Presentacion</h4>
                <h4>Concentracion</h4>
                <h4>Cantidad</h4>
                <h4>Dosis</h4>
            </div>
            <div v-for="(medicamento, index) in formData.Plan_manejo_medicamentos" :key="index"
                class="grid grid-cols-5 text-center gap-3">
                <p class="text-base">{{ medicamento.medicamento }}</p>
                <p class="text-base">{{ medicamento.presentacion }}</p>
                <p class="text-base">{{ medicamento.concentracion }}</p>
                <p class="text-base">{{ medicamento.cantidad }}</p>
                <p class="text-base">{{ medicamento.dosis }}</p>
            </div>
        </div>

        <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[20px] left-auto right-auto">
            <nuxtLink class="md:w-2/4 w-full">
                <button type="submit"
                    class="w-full text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    Atras
                </button>
                <button type="submit"
                    class="w-full text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    Registrar
                </button>
            </nuxtLink>
        </div>
    </Formulario>

</template>