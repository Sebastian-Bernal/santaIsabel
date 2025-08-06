<script setup>
// Componentes
import ModalFormLG from "~/components/Modales/ModalFormLG.vue";
import Formulario from "~/components/Forms/Formulario.vue";
import DatosUsers from "~/components/Forms/Users/DatosUsers.vue"
import IngresarPaciente from "../Pacientes/IngresarPaciente.vue";
import IngresarUsuario from "../Pacientes/IngresarUsuario.vue";
import IngresarProfesional from "../Profesionales/IngresarProfesional.vue";
// Data
import { useUsersStore } from "~/stores/Formularios/usuarios/Users.js";
import { useNotificacionesStore } from "~/stores/notificaciones.js";
import { useVarView } from "~/stores/varview.js";

const varView = useVarView();
const storeUser = useUsersStore();
const nuevoUserStore = storeUser.createForm("NuevoUsuario");
const notificacionesStore = useNotificacionesStore();
const usuarioRegistrado = ref([])

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
} = nuevoUserStore;

const { simple, mensaje, options } = notificacionesStore;

// Enviar formulario -------------------
const enviarNuevoUser = async (formData) => {
    event.preventDefault();

    const estado = await mandarFormulario(formData);
    if (estado) {
        options.position = "top-end";
        options.texto = "Usuario Registrado";
        options.background = '#94c53d'
        options.tiempo = 1500;
        mensaje();
        options.background = '#d33'
        limpiar();
        if(formData.User.rol === 'Paciente'){
            usuarioRegistrado.value = formData.User
            varView.showNuevoPacientePaso2 = true
        } else if(formData.User.rol === 'Profesional'){
            usuarioRegistrado.value = formData.User
            varView.showNuevoProfesionalPaso2 = true
        }
        storeUser.listUsers
    } else {
        options.icono = "error";
        options.titulo = "¡A ocurrido un problema!";
        options.texto = "No se pudo registrar User";
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
    varView.showNuevoUser = false;
}
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarNuevoUser"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{ cancelar: 'Atras', enviar: 'Registrar' }">
        <Formulario class="mt-3" :datos="{
            titulo: 'Nuevo User',
        }">
            <DatosUsers v-model:formData="nuevoUserStore.formData" :agregarItem="agregarItem"
                :eliminarItem="eliminarItem" :traerDatos="traerDatos" :guardarDatos="guardarDatos" />

        </Formulario>
    </ModalFormLG>
    <IngresarPaciente v-if="varView.showNuevoPacientePaso2" :usuario="usuarioRegistrado"/>
    <IngresarUsuario v-if="varView.showNuevoPaciente"/>
    <IngresarProfesional v-if="varView.showNuevoProfesionalPaso2" :usuario="usuarioRegistrado"/>
</template>
