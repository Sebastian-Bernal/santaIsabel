<script setup>
// Componentes
import ModalFormXS from '~/components/Modales/ModalFormXS.vue';
import Fondo from '~/components/Fondos/Fondo.vue';
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Inputs/Input.vue';
import Label from '~/components/Labels/Label.vue';
import Section from '~/components/Forms/Section.vue';
// Data
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { ref } from 'vue';
import { useVarView } from "../../stores/varview.js";

const varView = useVarView();
const HistoriaStore = useHistoriasStore();
const RegistrarHistoriaStore = HistoriaStore.createForm('RegistrarHistoria')
const notificacionesStore = useNotificacionesStore();

// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
} = RegistrarHistoriaStore;

const {
    simple,
    mensaje,
    options
} = notificacionesStore;

// Estructura de medicamento
const nuevoMedicamento = ref({
    medicamento: '',
    presentacion: '',
    concentracion: '',
    cantidad: '',
    dosis: '',
    id_paciente: formData.HistoriaClinica.id_paciente,
});

// funcion para validar y agregar medicemnto
const añadirMedicamento = () => {
    const medicamento = nuevoMedicamento.value;
    if (!medicamento.medicamento) {
        options.position = 'top-end';
        options.texto = 'Por favor, complete el medicamento antes de añadir uno nuevo.';
        options.tiempo = 1500
        mensaje()
        return;
    }
    formData.Plan_manejo_medicamentos.push({ ...medicamento });
    nuevoMedicamento.value = {
        medicamento: '',
        presentacion: '',
        concentracion: '',
        cantidad: '',
        dosis: '',
        id_paciente: formData.HistoriaClinica.id_paciente,
    };
};

// Guardar los datos en localStorage

watch(formData, (newValue) => {
    guardarDatos(newValue)
}, { deep: true });

onMounted(() => {
    traerDatos();
});

const cerrarModal = () => {
    varView.showMedicinas = false;
};

</script>

<template>
    <Fondo>
    <ModalFormXS :cerrarModal="cerrarModal" :enviarFormulario="cerrarModal" :formData="formData" :botones="{cancelar: 'Atras'}">
        <Formulario :datos="{
            titulo: 'Medicamentos',
        }">

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

            <!-- <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[10px] left-auto right-auto">
                <nuxtLink to="/Historial/Paso4">
                    <ButtonForm color="bg-gray-500"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Atras
                    </ButtonForm>
                </nuxtLink>
            </div> -->

        </Formulario>
    </ModalFormXS>
    </Fondo>
</template>