<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { ref, onMounted } from 'vue';
import { useVarView } from '~/stores/varview';
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario'
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

onMounted(async () => {
    await indexedDB.initialize()
    await indexedDB.adminDemo()
    sessionStorage.clear()
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
async function validaUsuario() {
    varView.cargando = true

    let options = {
        metodo: 'GET',
        url: config.public.authentication + Usuario.correo,
    }

    let validacion = await api.functionCall(options)

    if (validacion.data.length > 1) {
        selectEmpresa.value = true
        validacion.data.forEach((item) => {
            opcionesCompañy.value.push({ text: item.tenant_name, value: item.tenant_identifier })
        })
        console.log(opcionesCompañy.value)
    }

    varView.cargando = false
}

function recuperarContraseña() {
    // varView.showRecuperarContraseña = true
    show.value = true
}

function cerrar() {
    show.value = false
}

function cerrarCambiarContraseña() {
    show.value = false
}

function validarCodigo() {

}

async function enviarCodigo(data) {
    stateCodigo.value = await validarYEnviarRecuperarContraseña(data)
    console.log(stateCodigo.value)
}


// Formulario 



// Builder Pagina


const propiedadesLogin = computed(() => {
    const pagina = new ComponenteBuilder()
    const propiedadesForm = useLoginBuilder({
        storeId: 'Ingresar',
        storePinia: 'Login',
        recuperarcontraseña: recuperarContraseña
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