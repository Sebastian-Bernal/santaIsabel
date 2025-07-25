<script setup>
// Componentes
import ModalFormXS from "~/components/Modales/ModalFormXS.vue";
import DatosProfesional from "~/components/Forms/Profesionales/DatosProfesional.vue";
// Data
import { validarYEnviarEliminarMedico } from "~/Core/Profesional/EliminarMedico.js";
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico.js';
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";
import { ref, onMounted } from "vue";

const varView = useVarView();
const medicoStore = useMedicosStore();
const modificarMedicoStore = medicoStore.createForm('ModificarMedico')
const notificacionesStore = useNotificacionesStore();
const modificarMedico = ref(false)

// Nombre del Medico
const medicoAModificar = computed(() => formData.Medico.name ? formData.Medico.name : 'Medico')

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

const { alertRespuesta, simple, mensaje, options } = notificacionesStore;

// traer datos del medico seleccionado
onMounted(() => {
    // Si se pasa un medico por props, se asigna al formData
    if (props.medico) {
        formData.Medico = props.medico;
    }
});

// Cambiar botones al Actualizar o Ver
const botones = computed(() => ({
    cancelar: 'Cancelar',
    ...(modificarMedico.value ? { enviar: 'Modificar' } : {})
}));

// Enviar formulario -------------------
const enviarModificarMedico = async (formData) => {
    event.preventDefault()

    const estado = await mandarFormulario(formData)

    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Medico Modificado';
        options.tiempo = 2000
        const respuesta = await simple()
        if (respuesta.isConfirmed || respuesta.dismiss) {
            limpiar()
            varView.showModificarProfesional = false;
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
};

function actualizarMedico() {
    modificarMedico.value = !modificarMedico.value
};

async function eliminarMedico() {
    options.icono = 'warning';
    options.titulo = 'Deseas eliminar este Profesional?';
    options.html = `Se desactivara el medico: <span>${medicoAModificar.value}</span>`;
    options.confirmtext = 'Si, eliminar'
    options.canceltext = 'Cancelar'
    const respuestaAlert = await alertRespuesta()
    if (respuestaAlert === 'confirmado') {
        const res = validarYEnviarEliminarMedico(formData)
        if (res) {
            limpiar()
            window.location.href = '/Usuarios/Profesional'
            medicoStore.listMedicos
        }
    }
};
</script>

<template>
    <ModalFormXS :cerrarModal="cerrarModal" :enviarFormulario="enviarModificarMedico" :formData="formData"
        :formComplete="varView.formComplete" :validarform="validarform" :botones="botones">
        <div class="pb-5 z-1 flex flex-col items-center h-[90%]  bg-gray-50 rounded-2xl mt-[-12px]">
            <!-- Header -->
            <div
                class="w-full flex md:flex-row flex-col justify-between items-start gap-2 py-4 px-8 bg-[var(--color-default)] rounded-t-lg">
                <div>
                    <h2 class="text-white font-bold text-2xl">Informacion del Profesional</h2>
                    <div class="flex gap-8 text-gray-200 font-semibold">
                        <p class=""><span class="text-sm text-gray-300">Medico:</span> {{ medicoAModificar }}
                        </p>
                    </div>

                </div>
                <div class="flex h-full items-center justify-center gap-5 text-xl text-gray-200">
                    <i class="fa-solid fa-trash hover:text-white" @click="eliminarMedico"></i>
                    <i class="fa-solid fa-pencil hover:text-white" @click="actualizarMedico"></i>
                    <i class="fa-solid fa-close hover:text-white" @click="cerrarModal"></i>
                </div>
            </div>

            <div class="py-5 scrollForm w-full flex flex-col items-center gap-[15px] max-h-[87%] overflow-y-auto">
                <DatosProfesional :formData="formData" :traerDatos="traerDatos" :guardarDatos="guardarDatos"
                    :noCambiar="true" :verMedico="!modificarMedico" />
            </div>
        </div>
    </ModalFormXS>
</template>
