<script setup>
// Componentes 
import ModalFormLG from '~/components/Modales/ModalFormLG.vue';
import Formulario from '~/components/Forms/Formulario.vue';
import DatosPacientes from "../../Forms/Pacientes/DatosPacientes.vue"
// Data
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useVarView } from '../../stores/varview.js';
import { computed, onMounted } from 'vue'

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
    agregarItem,
    eliminarItem,
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

const validarform = () => {
    if (varView.formComplete) {
        options.position = 'top-end'
        options.texto = "Falta campos por llenar, por favor ingrese valores"
        options.tiempo = 1500
        mensaje()
    }
};

function cerrarModal() {
    limpiar()
    varView.showModificarPaciente = false;
}
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarModificarPaciente"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{cancelar: 'Cancelar', enviar: 'Modificar'}">
        <Formulario class="mt-3" :datos="{
            titulo: 'Modificar a ' + pacienteAModificar,
        }">
            <DatosPacientes :formData="formData" :agregarItem="agregarItem"
                :eliminarItem="eliminarItem" :traerDatos="traerDatos" :guardarDatos="guardarDatos" :noCambiar="true" />

        </Formulario>
    </ModalFormLG>
</template>
