<script setup>
// Componentes
import ModalFormXS from "~/components/Modales/ModalFormXS.vue";
import Formulario from "~/components/Forms/Formulario.vue";
import DatosAdministrativos from "~/components/Forms/Administrativos/DatosAdministrativo.vue"
// Data
import { useAdministrativosStore } from "~/stores/Formularios/administrativo/Administrativo.js";
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";

const varView = useVarView();
const storeAdministrativo = useAdministrativosStore();
const nuevoAdministrativoStore = storeAdministrativo.createForm("NuevoAdministrativo");
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
} = nuevoAdministrativoStore;

const { simple, mensaje, options } = notificacionesStore;

// Enviar formulario -------------------
const enviarNuevoAdministrativo = async (formData) => {
    event.preventDefault();

    const estado = await mandarFormulario(formData);
    if (estado) {
        options.icono = "success";
        options.titulo = "¡Se ha enviado correctamente!";
        options.texto = "Nuevo Administrativo Registrado";
        options.tiempo = 3000;
        const respuesta = await simple();
        if(respuesta.isConfirmed || respuesta.dismiss) {
            limpiar();
            varView.showNuevoAdministrativo = false;
            storeAdministrativo.listAdministrativos
        }
    } else {
        options.icono = "error";
        options.titulo = "¡A ocurrido un problema!";
        options.texto = "No se pudo registrar Administrativo";
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
    varView.showNuevoAdministrativo = false;
}
</script>

<template>
    <ModalFormXS :cerrarModal="cerrarModal" :enviarFormulario="enviarNuevoAdministrativo"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{ cancelar: 'Atras', enviar: 'Registrar' }">
        <Formulario class="mt-3" :datos="{
            titulo: 'Nuevo administrativo',
        }">
            <DatosAdministrativos :formData="formData" :agregarItem="agregarItem"
                :eliminarItem="eliminarItem" :traerDatos="traerDatos" :guardarDatos="guardarDatos" />

        </Formulario>
    </ModalFormXS>
</template>
