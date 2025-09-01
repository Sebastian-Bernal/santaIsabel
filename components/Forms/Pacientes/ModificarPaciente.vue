<script setup>
// Componentes 
import ModalFormLG from '~/components/molecules/Modals/ModalFormLG.vue';
// Data
import { validarYEnviarEliminarPaciente } from '~/Core/Paciente/EliminarPaciente';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js';
import { useVarView } from '../../stores/varview.js';
import { computed, onMounted } from 'vue';

const varView = useVarView();
const storePaciente = usePacientesStore();
const modificacionPacienteStore = storePaciente.createForm('ModificarPaciente');
const notificacionesStore = useNotificacionesStore();

const props = defineProps({
    paciente: {
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
} = modificacionPacienteStore;

const {
    alertRespuesta,
    simple,
    mensaje,
    options
} = notificacionesStore;

// Titulo del formulario
const pacienteAModificar = computed(() => formData.InformacionUser.name ? formData.InformacionUser.name : 'Paciente')
const modificarPaciente = ref(false)

// Traer datos del localStorage
onMounted(async() => {
    // Si se pasa un paciente por props, se asigna al formData
    if (props.paciente) {
        formData.User = {...formData.User, id: ''}
        // Propiedades que van en User
        const userKeys = Object.keys(formData.User)
        userKeys.forEach(key => {
            if (props.paciente.hasOwnProperty(key)) {
                formData.User[key] = props.paciente[key]
            }
        })

        // Propiedades que van en User informacion
        const userInfoKeys = Object.keys(formData.InformacionUser)
        userInfoKeys.forEach(key => {
            if (props.paciente.hasOwnProperty(key)) {
                formData.InformacionUser[key] = props.paciente[key]
            }
        })

        // Propiedades que van en paciente
        const pacienteKeys = Object.keys(formData.Paciente)
        pacienteKeys.forEach(key => {
            if (props.paciente.hasOwnProperty(key)) {
                formData.Paciente[key] = props.paciente[key]
            }
        })
        formData.Paciente = {...formData.Paciente, id: props.paciente.id_paciente}

        formData.Diagnosticos = await storePaciente.listDatos(props.paciente.id, 'Diagnosticos');
        formData.Antecedentes = await storePaciente.listDatos(props.paciente.id, 'Antecedentes');
    }
});

// Cambiar botones al Actualizar o Ver
const botones = computed(() => ({
    cancelar: 'Cancelar',
    ...(modificarPaciente.value ? { enviar: 'Modificar' } : {})
}));

// Enviar formulario -------------------
const enviarModificarPaciente = async (formData) => {
    event.preventDefault()

    const estado = await mandarFormulario(formData)

    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Informacion del Paciente modificado';
        options.tiempo = 2000
        const respuesta = await simple()
        if(respuesta.isConfirmed || respuesta.dismiss) {
            limpiar();
            varView.showModificarPaciente = false;
            storePaciente.listDatos
        }
    } else {
        options.icono = 'error';
        options.titulo = '¡A ocurrido un problema!';
        options.texto = 'No se pudo Modificar Paciente';
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
    varView.showModificarPaciente = false;
}

function actualizarPaciente() {
    modificarPaciente.value = !modificarPaciente.value
};

async function eliminarPaciente() {
    options.icono = 'warning';
    options.titulo = 'Deseas eliminar este Paciente?';
    options.html = `Se desactivara el paciente: <span>${pacienteAModificar.value}</span>`;
    options.confirmtext = 'Si, eliminar'
    options.canceltext = 'Cancelar'
    const respuestaAlert = await alertRespuesta()
    if(respuestaAlert === 'confirmado') {
        const res = validarYEnviarEliminarPaciente(formData)
        if(res){
            limpiar()
            location.reload()
            storePaciente.listPacientes;
        }
    }
};
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarModificarPaciente" :formData="formData"
        :formComplete="varView.formComplete" :validarform="validarform" :botones="botones">
        <div class="pb-5 z-1 flex flex-col items-center h-[90%] rounded-2xl">
            <!-- Header -->
            <div
                class="w-full flex md:flex-row flex-col justify-between items-start gap-2 py-4 px-8 bg-[var(--color-default)] rounded-t-lg">
                <div>
                    <h2 class="text-white font-bold text-2xl">Informacion del paciente</h2>
                    <div class="flex gap-8 text-gray-200 font-semibold">
                        <p class=""><span class="text-sm text-gray-300">Paciente:</span> {{ pacienteAModificar }}
                        </p>
                    </div>

                </div>
                <div class="flex h-full items-center justify-center gap-5 text-xl text-gray-200">
                    <i class="fa-solid fa-trash hover:text-white cursor-pointer *:" @click="eliminarPaciente"></i>
                    <i class="fa-solid fa-pencil hover:text-white cursor-pointer" @click="actualizarPaciente"></i>
                    <i class="fa-solid fa-close hover:text-white cursor-pointer" @click="cerrarModal"></i>
                </div>
            </div>

            <div class="px-5 pt-4 scrollForm w-full flex flex-col items-center gap-[15px] max-h-[87%] overflow-y-auto">
                <DatosUsers :formData="formData" :traerDatos="traerDatos" :guardarDatos="guardarDatos" :noCambiar="true"
                    :verUser="!modificarPaciente" />
                <DatosPacientes :formData="formData" :agregarItem="agregarItem" :eliminarItem="eliminarItem"
                    :traerDatos="traerDatos" :guardarDatos="guardarDatos" :noCambiar="true"
                    :verPaciente="!modificarPaciente" />
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
