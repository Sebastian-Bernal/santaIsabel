<script setup>
// Componentes 
import ModalLG from '~/components/Modales/ModalLG.vue';
import Fondo from "~/components/Fondos/Fondo.vue";
import Formulario from '~/components/Forms/Formulario.vue';
import Label from '~/components/Labels/Label.vue';
import Input from '~/components/Inputs/Input.vue';
import Section from '~/components/Forms/Section.vue';
import Select from '~/components/Selects/Select.vue';
import ButtonForm from '~/components/Buttons/ButtonForm.vue';
import DatosPacientes from "../../Forms/Pacientes/DatosPacientes.vue"
// Data
import { pacientes } from '~/data/pacientes.js';
import { ubicacion } from '../../data/colombia.js'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useVarView } from '../../stores/varview.js';
import { ref, computed, watch, onMounted } from 'vue'

const varView = useVarView();
const storePaciente = usePacientesStore();
const modificacionPacienteStore = storePaciente.createForm('ModificarPaciente');
const notificacionesStore = useNotificacionesStore();

const props = defineProps({
    paciente: {
        type: Object,
        default: () => ({})
    }
});
// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    estado,
    mandarFormulario,
} = modificacionPacienteStore;

const {
    simple,
    mensaje,
    options
} = notificacionesStore;

// Titulo del formulario
const pacienteAModificar = computed(() => formData.Paciente.name ? formData.Paciente.name : 'Paciente')

// Traer datos del localStorage
onMounted(() => {
    // Si se pasa un paciente por props, se asigna al formData
    if (props.paciente) {
        formData.Paciente = props.paciente;
    }
});


// Enviar formulario -------------------
const enviarModificarPaciente = async (formData) => {
    event.preventDefault()

    const estado = await mandarFormulario(formData)

    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Informacion del Paciente modificado';
        options.tiempo = 2000
        const res = await simple()
        limpiar()
        window.location.href = '/Usuarios/Pacientes';
    } else {
        options.icono = 'error';
        options.titulo = '¡A ocurrido un problema!';
        options.texto = 'No se pudo Modificar Paciente';
        options.tiempo = 2000
        simple()
    }
};

// Cuidades filtradas por departamento
const ciudades = computed(() => {
    return ubicacion.filter(data => data.departamento === formData.Paciente.departamento)[0].ciudades
}
);

const validarform = () => {
    if (varView.formComplete) {
        options.position = 'top-end'
        options.texto = "Falta campos por llenar, por favor ingrese valores"
        options.tiempo = 1500
        mensaje()
    }
};

function cerrarModal() {
    varView.showModificarPaciente = false;
    limpiar()
}
</script>

<template>
    <ModalLG>
        <Formulario class="mt-3" :datos="{
            titulo: 'Modificar a ' + pacienteAModificar,
        }">
            <DatosPacientes :formData="formData" :agregarItem="agregarItem"
                :eliminarItem="eliminarItem" :traerDatos="traerDatos" :guardarDatos="guardarDatos" />

        </Formulario>
        <div class="mt-2 w-full flex justify-center items-center gap-3">
            <nuxtLink @click="cerrarModal">
                <ButtonForm color="bg-gray-500"
                    class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    Cancelar
                </ButtonForm>
            </nuxtLink>
            <ButtonForm color="bg-blue-500" @click="varView.formComplete ? enviarModificarPaciente(formData) : validarform()"
                class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                Registrar
            </ButtonForm>
        </div>
    </ModalLG>
</template>
