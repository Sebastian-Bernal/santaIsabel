<script setup>
// Componentes
import ModalLG from "~/components/Modales/ModalLG.vue";
import Formulario from "~/components/Forms/Formulario.vue";
import Label from "~/components/Labels/Label.vue";
import Input from "~/components/Inputs/Input.vue";
import Section from "~/components/Forms/Section.vue";
import Select from "~/components/Selects/Select.vue";
import Button from "~/components/Buttons/Button.vue";
import ButtonForm from "~/components/Buttons/ButtonForm.vue";
import DatosPacientes from "../../Forms/Pacientes/DatosPacientes.vue"
// Data
import { CIE10 } from "~/data/CIE10.js";
import { ubicacion } from "../../data/colombia.js";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";

import { ref, computed, watch, onMounted, defineEmits } from "vue";

const emit = defineEmits(['close']);

const varView = useVarView();
const storePaciente = usePacientesStore();
const nuevoPacienteStore = storePaciente.createForm("NuevoPaciente");
const notificacionesStore = useNotificacionesStore();

// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    agregarItem,
    eliminarItem,
    limpiar,
    estado,
    mandarFormulario,
} = nuevoPacienteStore;

const { simple, mensaje, options } = notificacionesStore;

// Enviar formulario -------------------
const enviarNuevoPaciente = async (formData) => {
    event.preventDefault();

    const estado = await mandarFormulario(formData);
    if (estado) {
        options.icono = "success";
        options.titulo = "¡Se ha enviado correctamente!";
        options.texto = "Nuevo Paciente Registrado";
        options.tiempo = 3000;
        const res = await simple();
        limpiar();
        window.location.href = "/Usuarios/Pacientes";
    } else {
        options.icono = "error";
        options.titulo = "¡A ocurrido un problema!";
        options.texto = "No se pudo registrar Paciente";
        options.tiempo = 2000;
        simple();
    }
};

// Cuidades filtradas por departamento
const ciudades = computed(() => {
    return ubicacion.filter(
        (data) => data.departamento === formData.Paciente.departamento
    )[0].ciudades;

});

const validarform = () => {
    if (!formComplete.value) {
        options.position = "top-end";
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500;
        mensaje();
    }
};

function cerrarModal() {
    varView.showNuevoPaciente = false;
    limpiar();
}
</script>

<template>
    <ModalLG>
        <Formulario class="mt-3" :datos="{
            titulo: 'Nuevo paciente',
        }">
            <DatosPacientes :formData="formData" :agregarItem="agregarItem"
                :eliminarItem="eliminarItem" :traerDatos="traerDatos" :guardarDatos="guardarDatos" />

        </Formulario>
        <!--  -->
        <div class="mt-2 w-full flex justify-center items-center gap-3">
            <nuxtLink @click="cerrarModal">
                <ButtonForm color="bg-gray-500 " @click="limpiar()"
                    class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    Cancelar
                </ButtonForm>
            </nuxtLink>
            <ButtonForm color="bg-blue-500" @click="varView.formComplete ? enviarNuevoPaciente(formData) : validarform()"
                class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                Registrar
            </ButtonForm>
        </div>
    </ModalLG>
</template>
