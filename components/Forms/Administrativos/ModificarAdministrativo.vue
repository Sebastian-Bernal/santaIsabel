<script setup>
// Componentes 
import ModalFormLG from '~/components/Modales/ModalFormLG.vue';
import DatosAdministrativos from "~/components/Forms/Administrativos/DatosAdministrativo.vue"
// Data
// import { validarYEnviarEliminarAdministrativo } from '~/Core/Administrativo/EliminarAdministrativo';
import { useAdministrativosStore } from '~/stores/Formularios/administrativo/Administrativo';
import { useNotificacionesStore } from '../../stores/notificaciones.js';
import { useVarView } from '../../stores/varview.js';
import { computed, onMounted } from 'vue';

const varView = useVarView();
const storeAdministrativo = useAdministrativosStore();
const modificacionAdministrativoStore = storeAdministrativo.createForm('ModificarAdministrativo');
const notificacionesStore = useNotificacionesStore();

const props = defineProps({
    Administrativo: {
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
} = modificacionAdministrativoStore;

const {
    alertRespuesta,
    simple,
    mensaje,
    options
} = notificacionesStore;

// Titulo del formulario
const AdministrativoAModificar = computed(() => formData.Administrativo.name ? formData.Administrativo.name : 'Administrativo')
const modificarAdministrativo = ref(false)

// Traer datos del localStorage
onMounted(async() => {
    // Si se pasa un Administrativo por props, se asigna al formData
    if (props.Administrativo) {
        formData.Administrativo = props.Administrativo;
    }
});

// Cambiar botones al Actualizar o Ver
const botones = computed(() => ({
    cancelar: 'Cancelar',
    ...(modificarAdministrativo.value ? { enviar: 'Modificar' } : {})
}));

// Enviar formulario -------------------
const enviarModificarAdministrativo = async (formData) => {
    event.preventDefault()

    const estado = await mandarFormulario(formData)

    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Informacion del Administrativo modificado';
        options.tiempo = 2000
        const respuesta = await simple()
        if(respuesta.isConfirmed || respuesta.dismiss) {
            limpiar();
            varView.showModificarAdministrativo = false;
            storeAdministrativo.listAdministrativos
        }
    } else {
        options.icono = 'error';
        options.titulo = '¡A ocurrido un problema!';
        options.texto = 'No se pudo Modificar Administrativo';
        options.tiempo = 2000
        simple()
    }
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end'
        options.texto = "Falta campos por llenar, por favor ingrese valores"
        options.tiempo = 1500
        mensaje()
    }
};

function cerrarModal() {
    limpiar()
    varView.showModificarAdministrativo = false;
}

function actualizarAdministrativo() {
    modificarAdministrativo.value = !modificarAdministrativo.value
};

async function eliminarAdministrativo() {
    options.icono = 'warning';
    options.titulo = 'Deseas eliminar este Administrativo?';
    options.html = `Se desactivara el Administrativo: <span>${AdministrativoAModificar.value}</span>`;
    options.confirmtext = 'Si, eliminar'
    options.canceltext = 'Cancelar'
    const respuestaAlert = await alertRespuesta()
    if(respuestaAlert === 'confirmado') {
        const res = validarYEnviarEliminarAdministrativo(formData)
        if(res){
            limpiar()
            varView.showModificarAdministrativo = false
            storeAdministrativo.listAdministrativos;
        }
    }
};
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarModificarAdministrativo" :formData="formData"
        :formComplete="varView.formComplete" :validarform="validarform" :botones="botones">
        <div class="pb-5 z-1 flex flex-col items-center h-[90%] bg-gray-50 rounded-2xl">
            <!-- Header -->
            <div
                class="w-full flex md:flex-row flex-col justify-between items-start gap-2 py-4 px-8 bg-[var(--color-default)] rounded-t-lg">
                <div>
                    <h2 class="text-white font-bold text-2xl">Informacion del Administrativo</h2>
                    <div class="flex gap-8 text-gray-200 font-semibold">
                        <p class=""><span class="text-sm text-gray-300">Administrativo:</span> {{ AdministrativoAModificar }}
                        </p>
                    </div>

                </div>
                <div class="flex h-full items-center justify-center gap-5 text-xl text-gray-200">
                    <i class="fa-solid fa-trash hover:text-white cursor-pointer *:" @click="eliminarAdministrativo"></i>
                    <i class="fa-solid fa-pencil hover:text-white cursor-pointer" @click="actualizarAdministrativo"></i>
                    <i class="fa-solid fa-close hover:text-white cursor-pointer" @click="cerrarModal"></i>
                </div>
            </div>

            <div class="py-5 scrollForm w-full flex flex-col items-center gap-[15px] max-h-[87%] overflow-y-auto">
                <DatosAdministrativos :formData="formData" :agregarItem="agregarItem" :eliminarItem="eliminarItem"
                    :traerDatos="traerDatos" :guardarDatos="guardarDatos" :noCambiar="true"
                    :verAdministrativo="!modificarAdministrativo" />
            </div>
        </div>
    </ModalFormLG>
</template>

<style scoped>
/* Scroll */

.scrollForm::-webkit-scrollbar {
    height: 7px;
    width: 7px;
}

.scrollForm::-webkit-scrollbar-track {
    border-radius: 2px;
    background-color: #DFE9EB;
}

.scrollForm::-webkit-scrollbar-track:hover {
    background-color: #B8C0C2;
}

.scrollForm::-webkit-scrollbar-track:active {
    background-color: #B8C0C2;
}

.scrollForm::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: #326872;
}

.scrollForm::-webkit-scrollbar-thumb:hover {
    background-color: #576A72;
}

.scrollForm::-webkit-scrollbar-thumb:active {
    background-color: #107072;
}
</style>
