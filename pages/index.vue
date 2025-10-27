<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { ref, onMounted } from 'vue';
import { useVarView } from '~/stores/varview';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { useLoginBuilder } from '~/build/Login/useLoginBuilder';
import { useRecuperarContraseñaBuilder } from '~/build/Login/useRecuperarContraseñaBuilder.js';
import { validarYEnviarRecuperarContraseña } from '~/Core/Login/RecuperarContraseña';

definePageMeta({
    layout: 'authentication'
});

// 
const api = useApiRest()
const config = useRuntimeConfig()
const indexedDB = useIndexedDBStore();
const storeCodigos = useCodigos();

onMounted(async () => {
    try {
        await indexedDB.deleteDatabase('db-thesalus');
        await indexedDB.initialize(); // tu lógica de inicialización
        await storeCodigos.initialize();
        await storeCodigos.guardardatos()
        sessionStorage.clear();
    } catch (e) {
        console.error('No se pudo reiniciar IndexedDB:', e);
    }

})

const mostrarContraseña = ref(false);
const varView = useVarView();
const selectEmpresa = ref(false)
const opcionesCompañy = ref([])
const show = ref(false)
const stateCodigo = ref(false)

const cambiarMostrarContraseña = () => {
    mostrarContraseña.value = !mostrarContraseña.value;
    const passwordInput = document.getElementById('password');
    if (mostrarContraseña.value) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
};

// Temporal idexedDB
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

function cerrar() {
    show.value = false
}

function validarCodigo() {

}

async function enviarCodigo(data) {
    stateCodigo.value = await validarYEnviarRecuperarContraseña(data)
}


// Builder Pagina
const propiedadesLogin = computed(() => {
    const pagina = new ComponenteBuilder()
    const propiedadesForm = useLoginBuilder({
        storeId: 'Ingresar',
        storePinia: 'Login',
        recuperarcontraseña: recuperarContraseña,
        validaUsuario,
        selectEmpresa: selectEmpresa,
        opcionesCompañy: opcionesCompañy
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
    return pagina
        .setFondo('FondoBlur')
        .setContenedor('w-1/3 flex justify-center')
        .addComponente('Form', propiedadesForm)
        .addComponente('Form', propiedadesRecuperarContraseña)
        .build()
})
</script>

<template>
    <Pagina :Propiedades="propiedadesLogin" />
</template>

<style>
.logo {
    animation: aparecerLogo 1s;
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
</style>