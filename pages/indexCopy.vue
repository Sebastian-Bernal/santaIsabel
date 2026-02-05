<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import Input from '~/components/atoms/Inputs/Input.vue';

import { ref, onMounted } from 'vue';
import { useVarView } from '~/stores/varview';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { useLoginBuilder } from '~/build/Login/useLoginBuilder';
import { useRecuperarContraseñaBuilder } from '~/build/Login/useRecuperarContraseñaBuilder.js';
import { validarYEnviarRecuperarContraseña } from '~/Core/Login/RecuperarContraseña';
import { validarYEnviarLogin } from '~/Core/Login/Ingresar';
import { useIngresoContraseñaBuilder } from '~/build/Login/useIngresoContraseñaBuilder';
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';

definePageMeta({
    layout: 'authentication'
});

const Usuario = ref({
    correo: "",
    contraseña: "",
    empresa: ""
});

function enviarLogin(usuario) {
    validarYEnviarLogin({
        Usuario: { ...usuario }
    })
}

// 
const varView = useVarView();
const api = useApiRest()
const config = useRuntimeConfig()
const indexedDB = useIndexedDBStore();
const storeCodigos = useCodigos();
const mostrarContraseña = ref(false)

onMounted(async () => {
    try {
        varView.cargando = true
        await indexedDB.deleteDatabase('db-thesalus');
        await indexedDB.initialize(); // tu lógica de inicialización
        await storeCodigos.initialize();
        await storeCodigos.guardardatos()
        sessionStorage.clear();
        varView.cargando = false;
    } catch (e) {
        console.error('No se pudo reiniciar IndexedDB:', e);
        varView.cargando = false;
    }

})

const selectEmpresa = ref(false)
const opcionesCompañy = ref([])
const show = ref(false)
const showCambiar = ref(false)
const stateCodigo = ref(false)

// funcion para validar primer ingreso
async function validaUsuario(event) {
    const correo = event.target.value
    varView.cargando = true

    let options = {
        metodo: 'POST',
        url: config.public.primerIngreso,
        body: {
            correo: correo
        }
    }
    const respuesta = await api.functionCall(options)

    if (respuesta.primer_ingreso) {
        show.value = true
        stateCodigo.value = await validarYEnviarRecuperarContraseña({ Usuario: { correo: correo } })
    }

    varView.cargando = false
}

function recuperarContraseña() {
    show.value = true
}

function cambiarContraseña() {
    showCambiar.value = true
}

function cerrar() {
    show.value = false
    showCambiar.value = false
}

function validarCodigo() {

}

async function enviarCodigo(data) {
    varView.cargando = true
    stateCodigo.value = await validarYEnviarRecuperarContraseña(data)
    varView.cargando = false
}

// Builder Pagina
const propiedadesLogin = computed(() => {
    const pagina = new ComponenteBuilder()
    const propiedadesForm = useLoginBuilder({
        storeId: 'Ingresar',
        storePinia: 'Login',
        recuperarcontraseña: recuperarContraseña,
        cambiarContraseña,
        validaUsuario,
        selectEmpresa: selectEmpresa,
        opcionesCompañy: opcionesCompañy,
        mostrarContraseña
    });

    const propiedadesRecuperarContraseña = useRecuperarContraseñaBuilder({
        storeId: 'RecuperarContraseña',
        storePinia: 'Login',
        cerrar: cerrar,
        show: show,
        enviarCodigo,
        validarCodigo,
        stateCodigo: stateCodigo.value
    });

    const propiedadesCambiarContraseña = useIngresoContraseñaBuilder({
        storeId: 'CambiarContraseñaPrimerVez',
        storePinia: 'Login',
        cerrar: cerrar,
        show: showCambiar,
    })
    return pagina
        .setFondo('FondoBlur')
        .setContenedor('w-1/3 flex justify-center')
        .addComponente('Form', propiedadesForm)
        .addComponente('Form', propiedadesRecuperarContraseña)
        .addComponente('Form', propiedadesCambiarContraseña)
        .build()
})
</script>

<template>
    <FondoBlur>
        <div class="flex items-center justify-center md:w-[40%] md:h-[70%] w-[98%] h-[80%]">
            <div class="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 w-full animate-fadeIn">

                <!-- Logo -->
                <div class="flex justify-center mb-4">
                    <img src="assets/img/cross.png" alt="Logo" class="w-20 h-20 logo" />
                </div>

                <!-- Título -->
                <div class="text-center mb-6">
                    <h3 class="text-white text-3xl font-bold">Thesalus</h3>
                    <p class="text-gray-200 text-sm">Tu salud, nuestra prioridad</p>
                </div>

                <!-- Campo correo -->
                <Input v-model="Usuario.correo" :Propiedades="{
                    label: 'Correo Electrónico',
                    placeholder: 'Ingresa tu correo',
                    id: 'correo-user',
                    type: 'email',
                    tamaño: 'w-full text-white placeholder-gray-400 focus:outline-none py-2',
                    estilo: ' bg-[rgba(255,255,255,0.2)]',
                    icon: 'fa-solid fa-envelope text-white'
                }"></Input>

                <!-- Campo contraseña -->


                <!-- Botón ingresar -->
                <button type="button" @click="enviarLogin(Usuario)"
                    class="w-full bg-gradient-to-r from-[var(--color-default)] to-[var(--color-default-700)] text-white font-bold py-2 rounded-lg shadow-md hover:scale-105 transition-transform">
                    Ingresar
                </button>

                <!-- Recuperar contraseña -->
                <p class="text-sm mt-4 text-gray-100 text-center">
                    ¿Olvidaste tu contraseña?
                    <span @click="recuperarContraseña"
                        class="underline font-semibold cursor-pointer hover:text-teal-300">Recuperar</span>
                </p>

                <!-- Crear contraseña -->
                <p class="text-xs text-gray-300 text-center mt-2">
                    Primer Ingreso
                    <span @click="cambiarContraseña"
                        class="underline font-semibold cursor-pointer hover:text-teal-300">Crear Contraseña</span>
                </p>
            </div>
        </div>
    </FondoBlur>
</template>

<style>
.logo {
    animation: aparecerLogo 1s ease-out;
}

@keyframes aparecerLogo {
    0% {
        transform: translateY(-20px);
        opacity: 0;
    }

    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

.animate-fadeIn {
    animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>