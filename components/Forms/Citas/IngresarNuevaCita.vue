<script setup>
// Componentes
import ModalFormXS from '~/components/Modales/ModalFormXS.vue';
import Formulario from '~/components/Forms/Formulario.vue';
import DatosCitas from './DatosCitas.vue'
import IngresarProfesional from '~/components/Forms/Profesionales/IngresarProfesional.vue';
import IngresarPaciente from '~/components/Forms/Pacientes/IngresarPaciente.vue';
// Data
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useCitasStore } from '~/stores/Formularios/citas/Cita';
import { useVarView } from "../../stores/varview.js";

const varView = useVarView();
const citasStore = useCitasStore();
const NuevaCitaStore = citasStore.createForm('NuevaCita');

const notificacionesStore = useNotificacionesStore();


const {
    simple,
    mensaje,
    alertRespuesta,
    options
} = notificacionesStore;

const {
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    estado,
    mandarFormulario
} = NuevaCitaStore;


// Enviar formulario -------------------
const enviarNuevaCita = async (formData) => {
    event.preventDefault()
    const estado = await mandarFormulario(formData)

    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Nueva cita Registrada';
        options.tiempo = 3000
        const respuesta = await simple()
        if(respuesta.isConfirmed || respuesta.dismiss) {
            limpiar();
            window.location.href = '/Usuarios/Citas'
        }
    } else {
        options.icono = 'error';
        options.titulo = '¡A ocurrido un problema!';
        options.texto = 'No se pudo registrar Cita';
        options.tiempo = 2000
        simple()
    }
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};

function cerrarModal() {
    limpiar()
    varView.showNuevaCita = false;
}
</script>

<template>
    <ModalFormXS :cerrarModal="cerrarModal" :enviarFormulario="enviarNuevaCita"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{cancelar: 'Cancelar', enviar: 'Registrar'}">
        <Formulario :datos="{
            titulo: 'Nueva Cita Medica',
        }">
            <DatosCitas :formData="formData" :traerDatos="traerDatos" :guardarDatos="guardarDatos"/>

        </Formulario>
    </ModalFormXS>
    <IngresarProfesional  v-if="varView.showNuevoProfesional"/>
    <IngresarPaciente  v-if="varView.showNuevoPaciente"/>
</template>

<style scoped>
.autocomplete-list li {
    padding: 10px 15px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #eee;
}

.autocomplete-list li:last-child {
    border-bottom: none;
}

.autocomplete-list li:hover {
    background-color: #e5f0ff;
}
</style>