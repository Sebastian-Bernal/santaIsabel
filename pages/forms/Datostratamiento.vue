<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Forms/Input.vue';
import { ref } from 'vue';

definePageMeta({
    layout: 'authentication'
});

const formData = ref({
    medicamentos: [],
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

    formData.value.medicamentos.push({ ...medicamento });
    nuevoMedicamento.value = {
        medicamento: '',
        presentacion: '',
        concentracion: '',
        cantidad: '',
        dosis: ''
    };
};

</script>

<template>
    <Formulario :datos="
        { 
            titulo: 'Medicamentos', 
            botones: [
            { texto: 'Atras', ruta: '/forms/DatosConsulta', color: 'bg-gray-500' },
            { texto: 'Registrar', ruta: '/forms/DatosConsulta', color: 'bg-[var(--color-primary)]' }
        ] }">

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

            <div v-if="formData.medicamentos.length > 0" class="md:w-4/5 w-full border border-gray-300 rounded-md p-2">

                <div class="grid grid-cols-5 text-center text-xs justify-between items-center gap-3 mb-2">
                    <h4>Medicamento</h4>
                    <h4>Presentacion</h4>
                    <h4>Concentracion</h4>
                    <h4>Cantidad</h4>
                    <h4>Dosis</h4>
                </div>
                <div v-for="(medicamento, index) in formData.medicamentos" :key="index"
                    class="grid grid-cols-5 text-center gap-3">
                    <p class="text-base">{{ medicamento.medicamento }}</p>
                    <p class="text-base">{{ medicamento.presentacion }}</p>
                    <p class="text-base">{{ medicamento.concentracion }}</p>
                    <p class="text-base">{{ medicamento.cantidad }}</p>
                    <p class="text-base">{{ medicamento.dosis }}</p>
                </div>
            </div>
    </Formulario>

</template>