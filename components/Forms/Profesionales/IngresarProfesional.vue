<script setup>
// Componentes
import ModalFormXS from "~/components/Modales/ModalFormXS.vue";
import Formulario from "~/components/Forms/Formulario.vue";
import DatosProfesional from "~/components/Forms/Profesionales/DatosProfesional.vue";
// Data
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico.js';
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";

const varView = useVarView();
const medicoStore = useMedicosStore();
const nuevoMedicoStore = medicoStore.createForm('NuevoMedico')
const notificacionesStore = useNotificacionesStore();

// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    estado,
    mandarFormulario
} = nuevoMedicoStore;

const { simple, mensaje, options } = notificacionesStore;

// Enviar formulario -------------------
const enviarNuevoMedico = async (formData) => {
    event.preventDefault()

    const estado = await mandarFormulario(formData)

    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Nueva Medico Registrado';
        options.tiempo = 2000
        const respuesta = await simple()
        if (respuesta.isConfirmed || respuesta.dismiss) {
            limpiar()
            varView.showNuevoProfesional = false;
            medicoStore.listMedicos
        }
    } else {
        options.icono = 'error';
        options.titulo = '¡A ocurrido un problema!';
        options.texto = 'No se pudo registrar Medico';
        options.tiempo = 2000
        simple()
    }
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = "top-end";
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500;
        mensaje();
    }
};

function cerrarModal() {
    limpiar()
    varView.showNuevoProfesional = false;
}
</script>

<template>
    <ModalFormXS :cerrarModal="cerrarModal" :enviarFormulario="enviarNuevoMedico"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{cancelar: 'Atras', enviar: 'Registrar'}">
        <Formulario class="mt-3" :datos="{
            titulo: 'Nuevo Profesional de Medicina'
        }">
            <DatosProfesional :formData="formData" :traerDatos="traerDatos" :guardarDatos="guardarDatos"/>
        </Formulario>
    </ModalFormXS>
</template>
