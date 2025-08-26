<script setup>
import ModalXS from '~/components/Modales/ModalXS.vue';
import RecuperarContraseña from '~/components/Forms/Login/RecuperarContraseña.vue';
import CambiarContraseña from '~/components/Forms/Login/CambiarContraseña.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import { validarYEnviarLogin } from '~/Core/Login/Ingresar';
import { ref, onMounted } from 'vue';
import { useVarView } from '~/stores/varview';
import { useUsersStore } from '~/stores/Formularios/usuarios/Users';
import { validarYEnviarRecuperarContraseña } from '~/Core/Login/RecuperarContraseña';

const api = useApiRest()
const config = useRuntimeConfig()
definePageMeta({
    layout: 'authentication'
});

const indexedDB = useIndexedDBStore();

onMounted(async () => {
    await indexedDB.initialize()
    await indexedDB.adminDemo()
    sessionStorage.clear()
})

const Usuario = reactive({
    contraseña: '',
    correo: '',
})

const mostrarContraseña = ref(false);
const varView = useVarView();
const storeUsuarios = useUsersStore();
const notificacionesStore = useNotificacionesStore();
const selectEmpresa = ref(false)
const opcionesCompañy = ref([])

const {
    simple,
    mensaje,
    alertRespuesta,
    options
} = notificacionesStore;


const cambiarMostrarContraseña = () => {
    mostrarContraseña.value = !mostrarContraseña.value;
    const passwordInput = document.getElementById('password');
    if (mostrarContraseña.value) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
};

async function ingresar() {
    const respuesta = await validarYEnviarLogin(Usuario)

    if (respuesta.estado) {
        if (respuesta.home === 'Dashboard') {
            window.location.href = '/Home'
        } else if (respuesta.home === 'Historia') {
            window.location.href = '/Historia'
        } else if (respuesta.home === 'Citas') {
            window.location.href = '/Usuarios/Citas'
        }
    }
}

// Temporal idexedDB
async function validaUsuario() {
    varView.cargando = true
    /*codigo para manejo interno de indexbd ingreso de usuarios
    
    const usuarios = await storeUsuarios.listUsers

    const usuarioDB = usuarios.filter((usuario) => {
        return usuario.correo === Usuario.correo
    })

    if (usuarioDB.length > 0 && usuarioDB[0].contraseña === null || usuarioDB[0].contraseña === "") {
        const estado = await validarYEnviarRecuperarContraseña({correo: Usuario.correo, codigoRecuperacion: ''})

        if (estado) {
            options.icono = 'success';
            options.titulo = '¡Primer Inicio de Sesión!';
            options.texto = 'Verifica tu correo electronico para ingresar una contraseña en tu cuenta';
            options.tiempo = 5000
            const res = await simple()
            varView.showCambiarContraseña = true;
        }

    
    }*/

    let options = {
        metodo: 'GET',
        url: config.public.authentication + Usuario.correo,
    }

    let validacion = await api.functionCall(options)
    console.log(validacion)
    if(validacion.data.length > 1){
        selectEmpresa.value = true
        validacion.data.forEach((item) => {
            opcionesCompañy.value.push({text: item.tenant_name, value: item.tenant_identifier}) 
        })
        console.log(opcionesCompañy.value)
    }
    console.log(validacion)
    varView.cargando = false
}

function recuperarContraseña() {
    varView.showRecuperarContraseña = true
}



// api.metodo = 'GET'
// api.tabla = 'api/login'
// api.params = {
//   email: 'usuario@email.com',
//   password: '123456'
// }

// try {
//   const respuesta = await api.functionCall(api.tabla)
//   api.token = respuesta.token
//   api.user = respuesta.user
//   console.log('Autenticación exitosa:', api.user)
// } catch (error) {
//   console.error('Error al autenticar:', error.message)
// }

</script>

<template>

    <ModalXS color="bg-inherit" v-if="!varView.showRecuperarContraseña">
        <div class="flex flex-col w-full h-full justify-center items-center">
            <div class="flex flex-col justify-center items-center gap-1 pb-10">
                <img src="assets/img/cross.png" alt="" class="w-3/4 logo mb-5 select-none">
                <h3 class="text-white text-3xl font-bold">Thesalus</h3>
            </div>
            <div class="mb-5 md:w-2/4 lg:w-1/3 w-full">
                <div class="relative">
                    <input v-model="Usuario.correo" @keyup.enter="validaUsuario" type="email" id="text" name="email"
                        required placeholder="Correo Electronico"
                        class="bg-inherit text-white mt-1 pr-8 block w-full px-3 py-3 border border-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <i class="fa-solid fa-user absolute text-white right-[3%] top-[27%] text-lg"></i>
                </div>
            </div>
            <div v-if="selectEmpresa" class="mb-5 md:w-2/4 lg:w-1/3 w-full">
                <div class="relative">
                    <Select v-model="Usuario.correo" :Propiedades="{
                        name: 'empresa',
                        options: opcionesCompañy,
                        placeholder: 'Selecciona Empresa a ingresar'
                    }"   
                    />
                </div>
            </div>
            <div class="mb-5 md:w-2/4 lg:w-1/3 w-full">
                <div class="relative">
                    <input v-model="Usuario.contraseña" @keyup.enter="ingresar" type="password" id="password"
                        name="password" required placeholder="Contraseña" autocomplete="off" minlength="1"
                        class="text-white bg-inherit mt-1 pr-8 block w-full px-3 py-3 border border-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <i v-if="!mostrarContraseña"
                        class="fa-solid fa-eye-slash text-gray-50 absolute right-[2%] top-[27%] text-lg"
                        @click="cambiarMostrarContraseña()"></i>
                    <i v-if="mostrarContraseña" class="fa-solid fa-eye absolute text-white right-[2%] top-[27%] text-lg"
                        @click="cambiarMostrarContraseña()"></i>
                </div>

            </div>

            <div class="mt-5 md:w-2/4 lg:w-1/3 w-full">
                <button @click="ingresar" class="w-full h-[40px] bg-gray-100 text-[var(--color-default)] font-bold">
                    Ingresar
                </button>
            </div>

            <p class="text-sm my-3 text-gray-100">
                Olvidaste tu contraseña?
                <span @click="recuperarContraseña" class="underline font-semibold cursor-pointer">Recuperar</span>
            </p>
        </div>
    </ModalXS>
    <RecuperarContraseña v-if="varView.showRecuperarContraseña" />
    <CambiarContraseña v-if="varView.showCambiarContraseña" :correo="Usuario.correo" />
</template>