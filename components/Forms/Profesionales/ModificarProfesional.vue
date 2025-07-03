<script setup>
// Componentes
import ModalLG from "~/components/Modales/ModalLG.vue";
import Formulario from "~/components/Forms/Formulario.vue";
import DatosProfesional from "~/components/Forms/Profesionales/DatosProfesional.vue";
// Data
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico.js';
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";
import { ref, onMounted } from "vue";


const varView = useVarView();
const medicoStore = useMedicosStore();
const modificarMedicoStore = medicoStore.createForm('ModificarMedico')
const notificacionesStore = useNotificacionesStore();

const props = defineProps({
    medico: {
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
    mandarFormulario
} = modificarMedicoStore;

const { simple, mensaje, options } = notificacionesStore;

// traer datos del medico seleccionado
onMounted(() => {
    // Si se pasa un medico por props, se asigna al formData
    if (props.medico) {
        formData.Medico = props.medico;
    }
});

// Enviar formulario -------------------
const enviarModificarMedico = async (formData) => {
    event.preventDefault()

    const estado = await mandarFormulario(formData)

    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Medico Modificado';
        options.tiempo = 2000
        const res = await simple()
        limpiar()
        window.location.href = '/Usuarios/Profesional'
    } else {
        options.icono = 'error';
        options.titulo = '¡A ocurrido un problema!';
        options.texto = 'No se pudo registrar Medico';
        options.tiempo = 2000
        simple()
    }
};

const validarform = () => {
    if (!formComplete.value) {
        options.position = "top-end";
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500;
        mensaje();
    }
};

function cerrarModal() {
    limpiar()
    varView.showModificarProfesional = false;
}
</script>

<template>
    <ModalLG :cerrarModal="cerrarModal" :enviarFormulario="enviarModificarMedico"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="[]">
        <Formulario class="mt-3" :datos="{
            titulo: 'Modificar Profesional de Medicina'
        }">
            <DatosProfesional :formData="formData" :traerDatos="traerDatos" :guardarDatos="guardarDatos" :noCambiar="true"/>
        </Formulario>
    </ModalLG>
</template>
