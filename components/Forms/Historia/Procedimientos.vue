<script setup>
// Componentes
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Inputs/Input.vue';
import Label from '~/components/Labels/Label.vue';
import Section from '~/components/Forms/Section.vue';
import ModalFormLG from '~/components/Modales/ModalFormLG.vue';
import ButtonForm from '~/components/Buttons/ButtonForm.vue';
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

// estructura de servicio
const nuevoServicio = ref({
    descripcion: '',
    cantidad: '',
    mes: ''
});

// funcion validar y agregar nuevo servicio
const añadirServicio = () => {
    const servicio = nuevoServicio.value;
    if (!servicio.descripcion) {
        options.position = 'top-end';
        options.texto = 'Por favor, complete el servicio antes de añadir uno nuevo.';
        options.tiempo = 1500
        mensaje()
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

const cerrarModal = () => {
    varView.showProcedimientos = false;
};
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="cerrarModal" :botones="{cancelar: 'Atras'}">
        <Formulario :datos="{
            titulo: 'Datos del procedimiento',
        }">

            <Label forLabel="descripcion">Plan de manejo</Label>
            <Section>
                <Input v-model="nuevoServicio.descripcion" type="text" id="descripcion" name="descripcion"
                    placeholder="Descripcion" tamaño="w-full" />
            </Section>

            <Section>
                <Input v-model="nuevoServicio.cantidad" type="text" id="cantidad" name="cantidad" placeholder="Cantidad"
                    tamaño="w-1/2" />
                <Input v-model="nuevoServicio.mes" type="text" id="mes" name="mes" placeholder="Mes" tamaño="w-1/2" />
            </Section>


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
    </ModalFormLG>
</template>