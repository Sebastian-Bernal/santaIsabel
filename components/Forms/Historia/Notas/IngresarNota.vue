<script setup>
// Componentes
import ModalFormLG from '~/components/Modales/ModalFormLG.vue';
import Formulario from '~/components/Forms/Formulario.vue';
import DatosNotas from './DatosNotas.vue';
// Data
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useNotasStore } from '~/stores/Formularios/historias/Notas';
import { useVarView } from "../../stores/varview.js";

const varView = useVarView();
const notasStore = useNotasStore();
const Nuevanotastore = notasStore.createForm('NuevaNota');

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
} = Nuevanotastore;


// Enviar formulario -------------------
const enviarNuevaNota = async (formData) => {
    event.preventDefault()
    const estado = await mandarFormulario(formData)

    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Nueva nota Registrada';
        options.tiempo = 3000
        const respuesta = await simple()
        if(respuesta.isConfirmed || respuesta.dismiss) {
            limpiar();
            window.location.href = '/Historial/Historias'
        }
    } else {
        options.icono = 'error';
        options.titulo = '¡A ocurrido un problema!';
        options.texto = 'No se pudo registrar nota';
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
    varView.showNuevaNota = false;
};
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarNuevaNota"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{cancelar: 'Cancelar', enviar: 'Registrar'}">
        <Formulario class="mt-3" :datos="{
            titulo: 'Nueva Nota de Enfermeria',
        }">
            <DatosNotas :formData="formData" :traerDatos="traerDatos" :guardarDatos="guardarDatos"/>

        </Formulario>
    </ModalFormLG>
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