<script setup>
// Componentes
import ModalFormLG from "~/components/Modales/ModalFormLG.vue";
import FormularioWizard from "~/components/Forms/FormularioWizard.vue";
import DatosProfesional from "~/components/Forms/Profesionales/DatosProfesional.vue";
// Data
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico.js';
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";

const varView = useVarView();
const medicoStore = useMedicosStore();
const nuevoMedicoStore = medicoStore.createForm('NuevoMedico')
const notificacionesStore = useNotificacionesStore();

const props = defineProps(['usuario'])
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

onMounted(() => {
    if(props.usuario){
        console.log(props.usuario)
        formData.User = props.usuario
    } 
})

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
            varView.showNuevoProfesionalPaso2 = false;
            varView.showNuevoUser = false;
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
    console.log('hola')
    varView.showNuevoProfesional = true;
    varView.showNuevoProfesionalPaso2 = false;
}
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarNuevoMedico"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{cancelar: 'Atras', enviar: 'Registrar'}">
        <FormularioWizard class="mt-[-13px]" :datos="{
            titulo: 'Datos del Usuario',
            tituloFormulario: 'Nuevo Profesional',
            secciones: [
                { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
            ]
        }">
            <DatosProfesional :formData="formData" :traerDatos="traerDatos" :guardarDatos="guardarDatos"/>
        </FormularioWizard>
    </ModalFormLG>
</template>
