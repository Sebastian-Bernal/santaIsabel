<script setup>
// Componentes
import ModalFormLG from "~/components/Modales/ModalFormLG.vue";
import FormularioWizard from "~/components/Forms/FormularioWizard.vue";
import DatosUsers from "~/components/Forms/Users/DatosUsers.vue"
// Data
import { useUsersStore } from "~/stores/Formularios/usuarios/Users.js";
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico.js';
import { useNotificacionesStore } from "~/stores/notificaciones.js";
import { useVarView } from "~/stores/varview.js";

const varView = useVarView();
const medicoStore = useMedicosStore();
const nuevoMedicoStore = medicoStore.createForm('NuevoMedico')
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
} = nuevoMedicoStore;

const { simple, mensaje, options } = notificacionesStore;

// Enviar formulario -------------------
const enviarNuevoUser = () => {
    event.preventDefault();

    varView.showNuevoProfesional = false;
    varView.showNuevoProfesionalPaso2 = true;
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
};

function cerrar () {
    limpiar()
    varView.showNuevoProfesional = false;
    varView.showNuevoProfesionalPaso2 = false;
};
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarNuevoUser"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{ cancelar: 'Atras', enviar: 'Siguiente' }">
        <FormularioWizard :datos="{
            titulo: 'Datos del Usuario',
            tituloFormulario: 'Nuevo Profesional',
            secciones: [
                { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, color: 'bg-gray-300' },
            ]
        }">
            <DatosUsers v-model:formData="nuevoMedicoStore.formData" :agregarItem="agregarItem"
                :eliminarItem="eliminarItem" :traerDatos="traerDatos" :guardarDatos="guardarDatos" formulario="Profesional" />

        </FormularioWizard>
    </ModalFormLG>
</template>
