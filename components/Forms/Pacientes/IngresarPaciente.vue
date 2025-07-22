<script setup>
// Componentes
import ModalFormLG from "~/components/Modales/ModalFormLG.vue";
import Formulario from "~/components/Forms/Formulario.vue";
import DatosPacientes from "../../Forms/Pacientes/DatosPacientes.vue"
// Data
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";

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
        const respuesta = await simple();
        if(respuesta.isConfirmed || respuesta.dismiss) {
            limpiar();
            varView.showNuevoPaciente = false;
            storePaciente.listPacientes
        }
    } else {
        options.icono = "error";
        options.titulo = "¡A ocurrido un problema!";
        options.texto = "No se pudo registrar Paciente";
        options.tiempo = 2000;
        simple();
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
    varView.showNuevoPaciente = false;
}
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarNuevoPaciente"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{ cancelar: 'Atras', enviar: 'Registrar' }">
        <Formulario class="mt-3" :datos="{
            titulo: 'Nuevo paciente',
        }">
            <DatosPacientes :formData="formData" :agregarItem="agregarItem"
                :eliminarItem="eliminarItem" :traerDatos="traerDatos" :guardarDatos="guardarDatos" />

        </Formulario>
    </ModalFormLG>
</template>
