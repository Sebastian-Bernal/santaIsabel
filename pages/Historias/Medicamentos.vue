<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Inputs/Input.vue';
import Label from '~/components/Labels/Label.vue';
import Section from '~/components/Forms/Section.vue';
import Fondo from '~/components/Fondos/Fondo.vue';
import ButtonForm from '~/components/Buttons/ButtonForm.vue';
import { ref } from 'vue';
import { useRegistrarHistoriaStore } from '~/stores/Formularios/RegistrarHistoria';

const RegistrarHistoriaStore = useRegistrarHistoriaStore(); // Se instancia aquí

const {
    formData,
    traerDatos,
    guardarDatos,
} = RegistrarHistoriaStore;

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
    formData.Plan_manejo_medicamentos.push({ ...medicamento });
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
    guardarDatos(newValue)
}, { deep: true });

onMounted(() => {
    traerDatos();
});

</script>

<template>
    <Fondo>
        <Formulario :datos="{
            titulo: 'Medicamentos',
            botones: [
                { texto: 'Atras', ruta: '/Historias/Paso3', color: 'bg-gray-500' },
            ],
        }" tamaño="w-[60%] h-[60%]">

            <Label forLabel="medicamento">Plan de manejo</Label>
            <Section class="md:flex-row flex-col">
                <Input v-model="nuevoMedicamento.medicamento" type="text" id="medicamento" name="medicamento"
                    placeholder="Nombre del medicamento" tamaño="md:w-3/4 w-full" />
                <Input v-model="nuevoMedicamento.presentacion" type="text" id="presentacion" name="presentacion"
                    placeholder="Presentacion" tamaño="md:w-1/4 w-full" />
            </Section>

            <Section class="md:flex-row flex-col">
                <Input v-model="nuevoMedicamento.concentracion" type="text" id="concentracion" name="concentracion"
                    placeholder="Concentracion" tamaño="md:w-1/3 w-full" />

                <Input v-model="nuevoMedicamento.cantidad" type="text" id="cantidad" name="cantidad"
                    placeholder="Cantidad" tamaño="md:w-1/3 w-full" />

                <Input v-model="nuevoMedicamento.dosis" type="text" id="dosis" name="dosis" placeholder="Dosis"
                    tamaño="md:w-1/3 w-full" />
            </Section>


            <div class="md:w-4/5 w-full flex justify-end">
                <button type="button" @click="añadirMedicamento()"
                    class="bg-gray-500 text-white text-xs font-semibold mt-2 py-2 px-3 rounded cursor-pointer hover:opacity-75">
                    Añadir medicamento
                </button>
            </div>

            <div v-if="formData.Plan_manejo_medicamentos.length > 0"
                class="md:w-4/5 w-full border border-gray-300 rounded-md p-2">

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

            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[10px] left-auto right-auto">
                <nuxtLink to="/Historias/Paso3">
                    <ButtonForm color="bg-gray-500"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Atras
                    </ButtonForm>
                </nuxtLink>
            </div>

        </Formulario>
    </Fondo>
</template>