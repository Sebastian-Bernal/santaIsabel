<script setup>
// Componentes 
import ModalFormLG from '~/components/Modales/ModalFormLG.vue';
import DatosUsers from "~/components/Forms/Users/DatosUsers.vue"
// Data
// import { validarYEnviarEliminarUser } from '~/Core/User/EliminarUser';
import { useUsersStore } from '~/stores/Formularios/usuarios/Users.js';
import { validarYEnviarEliminarUsuario } from '~/Core/Usuario/EliminarUsuario';
import { computed, onMounted } from 'vue';

const varView = useVarView();
const storeUser = useUsersStore();
const modificacionUserStore = storeUser.createForm('ModificarUsuario');
const notificacionesStore = useNotificacionesStore();

const props = defineProps({
    User: {
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
} = modificacionUserStore;

const {
    alertRespuesta,
    simple,
    mensaje,
    options
} = notificacionesStore;

// Titulo del formulario
const UserAModificar = computed(() => formData.User.name ? formData.User.name : 'Usuario')
const modificarUser = ref(false)

// Traer datos del localStorage
onMounted(async() => {
    // Si se pasa un User por props, se asigna al formData
    if (props.User) {
        formData.User = props.User;
    }
});

// Cambiar botones al Actualizar o Ver
const botones = computed(() => ({
    cancelar: 'Cancelar',
    ...(modificarUser.value ? { enviar: 'Modificar' } : {})
}));

// Enviar formulario -------------------
const enviarModificarUser = async (formData) => {
    event.preventDefault()

    const estado = await mandarFormulario(formData)

    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Informacion del Usuario modificado';
        options.tiempo = 2000
        const respuesta = await simple()
        if(respuesta.isConfirmed || respuesta.dismiss) {
            limpiar();
            varView.showModificarUser = false;
            storeUser.listUsers
        }
    } else {
        options.icono = 'error';
        options.titulo = '¡A ocurrido un problema!';
        options.texto = 'No se pudo Modificar Usuario';
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
    varView.showModificarUser = false;
}

function actualizarUser() {
    modificarUser.value = !modificarUser.value
};

async function eliminarUser() {
    options.icono = 'warning';
    options.titulo = 'Deseas eliminar este Usuario?';
    options.html = `Se desactivara el Usuario: <span>${UserAModificar.value}</span>`;
    options.confirmtext = 'Si, eliminar'
    options.canceltext = 'Cancelar'
    const respuestaAlert = await alertRespuesta()
    if(respuestaAlert === 'confirmado') {
        const res = validarYEnviarEliminarUsuario(formData)
        if(res){
            limpiar()
            varView.showModificarUser = false
            location.reload()
            storeUser.listUsers;
        }
    }
};
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarModificarUser" :formData="formData"
        :formComplete="varView.formComplete" :validarform="validarform" :botones="botones">
        <div class="pb-5 z-1 flex flex-col items-center h-[90%] bg-gray-50 rounded-2xl mt-[-12px]">
            <!-- Header -->
            <div
                class="w-full flex md:flex-row flex-col justify-between items-start gap-2 py-4 px-8 bg-[var(--color-default)] rounded-t-lg">
                <div>
                    <h2 class="text-white font-bold text-2xl">Informacion del Usuario</h2>
                    <div class="flex gap-8 text-gray-200 font-semibold">
                        <p class=""><span class="text-sm text-gray-300">Usuario:</span> {{ UserAModificar }}
                        </p>
                    </div>

                </div>
                <div class="flex h-full items-center justify-center gap-5 text-xl text-gray-200">
                    <i class="fa-solid fa-trash hover:text-white cursor-pointer *:" @click="eliminarUser"></i>
                    <i class="fa-solid fa-pencil hover:text-white cursor-pointer" @click="actualizarUser"></i>
                    <i class="fa-solid fa-close hover:text-white cursor-pointer" @click="cerrarModal"></i>
                </div>
            </div>

            <div class="py-5 px-5 scrollForm w-full flex flex-col items-center gap-[15px] max-h-[87%] overflow-y-auto">
                <DatosUsers :formData="formData" :agregarItem="agregarItem" :eliminarItem="eliminarItem"
                    :traerDatos="traerDatos" :guardarDatos="guardarDatos" :noCambiar="true"
                    :verUser="!modificarUser" />
            </div>
        </div>
    </ModalFormLG>
</template>
